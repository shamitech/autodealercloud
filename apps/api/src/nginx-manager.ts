import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'

const execAsync = promisify(exec)
const writeFileAsync = promisify(fs.writeFile)
const mkdirAsync = promisify(fs.mkdir)

export class NginxManager {
  private static NGINX_CONF_DIR = '/etc/nginx/conf.d'
  
  // Temporary HTTP-only config (used during cert provisioning)
  private static TEMP_HTTP_TEMPLATE = `# Temporary HTTP-only Nginx Configuration for: {CUSTOM_DOMAIN}
# Used for SSL certificate validation with certbot
# Tenant ID: {TENANT_ID}
# Generated: {TIMESTAMP}

server {
    listen 80;
    server_name {CUSTOM_DOMAIN};
    
    # Allow certbot to validate via HTTP challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect other traffic to HTTPS once cert is ready
    location / {
        return 301 https://$server_name$request_uri;
    }
}
`

  // Full HTTPS config (used after cert is obtained)
  private static CUSTOM_DOMAIN_TEMPLATE = `# Nginx Configuration for Custom Domain: {CUSTOM_DOMAIN}
# Tenant ID: {TENANT_ID}
# Generated: {TIMESTAMP}

server {
    listen 80;
    server_name {CUSTOM_DOMAIN};
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name {CUSTOM_DOMAIN};

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/{DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Tenant publisher (Next.js app on port 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Tenant-Domain {CUSTOM_DOMAIN};
        proxy_set_header X-Tenant-ID {TENANT_ID};
        proxy_cache_bypass $http_upgrade;
    }
}
`

  /**
   * Generate Nginx configuration for a custom domain
   */
  static generateConfig(
    customDomain: string,
    baseDomain: string,
    tenantId: string
  ): string {
    const timestamp = new Date().toISOString()
    return this.CUSTOM_DOMAIN_TEMPLATE.replace(/{CUSTOM_DOMAIN}/g, customDomain)
      .replace(/{DOMAIN}/g, baseDomain)
      .replace(/{TENANT_ID}/g, tenantId)
      .replace(/{TIMESTAMP}/g, timestamp)
  }

  /**
   * Generate temporary HTTP-only config for SSL certificate provisioning
   */
  static generateTempHttpConfig(
    customDomain: string,
    tenantId: string
  ): string {
    const timestamp = new Date().toISOString()
    return this.TEMP_HTTP_TEMPLATE.replace(/{CUSTOM_DOMAIN}/g, customDomain)
      .replace(/{TENANT_ID}/g, tenantId)
      .replace(/{TIMESTAMP}/g, timestamp)
  }

  /**
   * Deploy temporary HTTP-only config to enable certbot validation
   */
  static async deployTempHttpConfig(
    customDomain: string,
    tenantId: string
  ): Promise<{ success: boolean; message?: string; error?: string; configPath?: string }> {
    try {
      const configContent = this.generateTempHttpConfig(customDomain, tenantId)
      const configFileName = `custom-domain-${tenantId}-${customDomain.replace(/\./g, '-')}.conf`
      const configPath = path.join(this.NGINX_CONF_DIR, configFileName)

      console.log(`Deploying temporary HTTP config for ${customDomain}:\n${configContent}`)

      // Write the config file
      await writeFileAsync(configPath, configContent, 'utf8')
      console.log(`Temporary config written to ${configPath}`)

      // Reload Nginx
      await execAsync('nginx -s reload')
      console.log('Nginx reloaded with temporary config')

      return {
        success: true,
        message: `Temporary HTTP config deployed for ${customDomain}. Ready for certificate validation.`,
        configPath,
      }
    } catch (error: any) {
      console.error('Failed to deploy temporary config:', error.message)
      return {
        success: false,
        error: `Deployment failed: ${error.message}`,
      }
    }
  }

  /**
   * Deploy Nginx configuration to the server
   * Returns { success: true, message, configPath } or { success: false, error }
   */
  static async deployConfig(
    customDomain: string,
    baseDomain: string,
    tenantId: string
  ): Promise<{ success: boolean; message?: string; error?: string; configPath?: string }> {
    try {
      // Generate config
      const configContent = this.generateConfig(customDomain, baseDomain, tenantId)
      const configFileName = `custom-domain-${tenantId}-${customDomain.replace(/\./g, '-')}.conf`
      const configPath = path.join(this.NGINX_CONF_DIR, configFileName)

      // Write config to temporary file first (simulate writing)
      // In production, this would write directly to /etc/nginx/conf.d/
      console.log(`Generated config for ${customDomain}:\n${configContent}`)

      // Validate Nginx syntax
      const validateResult = await this.validateNginxConfig(configContent, configPath)
      if (!validateResult.valid) {
        return {
          success: false,
          error: `Nginx syntax validation failed: ${validateResult.error}`,
        }
      }

      // Write the config file
      await writeFileAsync(configPath, configContent, 'utf8')
      console.log(`Nginx config written to ${configPath}`)

      // Reload Nginx
      await execAsync('nginx -s reload')
      console.log('Nginx reloaded successfully')

      return {
        success: true,
        message: `Domain configured successfully. Nginx reloaded.`,
        configPath,
      }
    } catch (error: any) {
      console.error('Failed to deploy Nginx config:', error.message)
      return {
        success: false,
        error: `Deployment failed: ${error.message}`,
      }
    }
  }

  /**
   * Validate Nginx configuration syntax
   */
  static async validateNginxConfig(
    configContent: string,
    configPath: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      // This would require writing to a temp file and testing
      // For now, basic validation
      if (!configContent.includes('server {')) {
        return { valid: false, error: 'Invalid Nginx config structure' }
      }
      return { valid: true }
    } catch (error: any) {
      return { valid: false, error: error.message }
    }
  }

  /**
   * Provision SSL certificate using certbot
   * This should be called BEFORE deployConfig to ensure certificates exist
   */
  static async provisionSSLCertificate(
    customDomain: string,
    baseDomain: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Check if certificate already exists
      const certPath = `/etc/letsencrypt/live/${baseDomain}`
      try {
        fs.accessSync(certPath)
        console.log(`SSL certificate already exists for ${baseDomain}`)
        return {
          success: true,
          message: `SSL certificate already exists for ${baseDomain}`,
        }
      } catch {
        // Certificate doesn't exist, request new one
        console.log(`Certificate not found, requesting new one for ${baseDomain}`)
      }

      // Request certificate with nginx plugin (works with nginx already running)
      // The nginx plugin modifies the nginx config temporarily for verification
      try {
        const { stdout, stderr } = await execAsync(
          `certbot certonly --nginx -d ${customDomain} -d ${baseDomain} --non-interactive --agree-tos --email admin@autodealercloud.com 2>&1`,
          { timeout: 120000 }
        )
        console.log('Certbot output:', stdout)
        if (stderr) console.log('Certbot stderr:', stderr)

        return {
          success: true,
          message: `SSL certificate provisioned successfully for ${customDomain}`,
        }
      } catch (certbotError: any) {
        // If nginx plugin fails, try with --expand flag in case partial cert exists
        try {
          const { stdout } = await execAsync(
            `certbot certonly --nginx -d ${customDomain} -d ${baseDomain} --non-interactive --agree-tos --email admin@autodealercloud.com --expand 2>&1`,
            { timeout: 120000 }
          )
          console.log('Certbot expand output:', stdout)
          return {
            success: true,
            message: `SSL certificate provisioned/expanded successfully for ${customDomain}`,
          }
        } catch (expandError: any) {
          console.error('Certbot provisioning failed:', certbotError.message)
          // Try manual DNS challenge as last resort
          console.log(`Note: DNS challenge may be required. Run manually: certbot certonly --manual -d ${customDomain} -d ${baseDomain}`)
          throw new Error(`SSL certificate provisioning failed: ${certbotError.message}. Domain may need to point to server IP or DNS may need configuration.`)
        }
      }
    } catch (error: any) {
      console.error('SSL provisioning error:', error.message)
      // Throw error so deployment fails and user knows cert is needed
      throw error
    }
  }

  /**
   * Remove domain configuration
   */
  static async removeConfig(tenantId: string, domain: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const configFileName = `custom-domain-${tenantId}-${domain.replace(/\./g, '-')}.conf`
      const configPath = path.join(this.NGINX_CONF_DIR, configFileName)

      // Check if file exists
      if (!fs.existsSync(configPath)) {
        return {
          success: true,
          message: `Config file not found (already removed or never created)`,
        }
      }

      // Remove the file
      fs.unlinkSync(configPath)
      console.log(`Removed config: ${configPath}`)

      // Reload Nginx
      await execAsync('nginx -s reload')
      console.log('Nginx reloaded after config removal')

      return {
        success: true,
        message: `Domain configuration removed and Nginx reloaded`,
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to remove config: ${error.message}`,
      }
    }
  }

  // Create Nginx config for tenant CMS subdomain
  static async createTenantCmsSubdomain(
    subdomain: string,
    tenantId: string,
    port: number = 3002 // tenant-cms port
  ) {
    try {
      // Validate subdomain format
      if (!subdomain.match(/^[a-z0-9-]+$/)) {
        return {
          success: false,
          error: 'Subdomain must contain only lowercase letters, numbers, and hyphens',
        }
      }

      const domain = `${subdomain}.autodealercloud.com`
      const configFileName = `tenant-cms-${subdomain}.conf`
      const configPath = path.join(this.NGINX_CONF_DIR, configFileName)

      const template = `# Nginx Configuration for Tenant CMS: ${domain}
# Tenant ID: ${tenantId}
# Generated: ${new Date().toISOString()}

server {
    listen 80;
    listen 443 ssl http2;
    server_name ${domain};
    ssl_certificate /etc/letsencrypt/live/autodealercloud.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/autodealercloud.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNuLl!MD5;
    ssl_prefer_server_ciphers on;

    if ($scheme != https) { return 301 https://$server_name$request_uri; }

    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Tenant-ID ${tenantId};
        proxy_cache_bypass $http_upgrade;
    }
}
`

      // Write config file
      await writeFileAsync(configPath, template)
      console.log(`Created tenant CMS config: ${configPath}`)

      // Test Nginx config syntax
      await execAsync('nginx -t')

      // Reload Nginx
      await execAsync('nginx -s reload')
      console.log('Nginx reloaded for tenant CMS subdomain')

      return {
        success: true,
        message: `Tenant CMS subdomain created: ${domain}`,
        domain,
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to create tenant CMS subdomain: ${error.message}`,
      }
    }
  }

  // Remove Nginx config for tenant CMS subdomain
  static async removeTenantCmsSubdomain(subdomain: string) {
    try {
      const configFileName = `tenant-cms-${subdomain}.conf`
      const configPath = path.join(this.NGINX_CONF_DIR, configFileName)

      // Check if file exists
      if (!fs.existsSync(configPath)) {
        return {
          success: true,
          message: `Config file not found (already removed or never created)`,
        }
      }

      // Remove the file
      fs.unlinkSync(configPath)
      console.log(`Removed tenant CMS config: ${configPath}`)

      // Reload Nginx
      await execAsync('nginx -s reload')
      console.log('Nginx reloaded after tenant CMS config removal')

      return {
        success: true,
        message: `Tenant CMS subdomain configuration removed and Nginx reloaded`,
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to remove tenant CMS subdomain: ${error.message}`,
      }
    }
  }
}
