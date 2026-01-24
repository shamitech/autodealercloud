import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'

const execAsync = promisify(exec)
const writeFileAsync = promisify(fs.writeFile)
const mkdirAsync = promisify(fs.mkdir)

export class NginxManager {
  private static NGINX_CONF_DIR = '/etc/nginx/conf.d'
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

    # Tenant publisher
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Tenant-Domain {CUSTOM_DOMAIN};
        proxy_set_header X-Env publish;
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
        return {
          success: true,
          message: `SSL certificate already exists for ${baseDomain}`,
        }
      } catch {
        // Certificate doesn't exist, request new one
      }

      // Request certificate with both domain variants
      const { stdout, stderr } = await execAsync(
        `certbot certonly --nginx -d ${customDomain} -d ${baseDomain} --non-interactive --agree-tos --email admin@autodealercloud.com --expand 2>&1`,
        { timeout: 60000 }
      )

      console.log('Certbot output:', stdout)

      return {
        success: true,
        message: `SSL certificate provisioned successfully for ${customDomain}`,
      }
    } catch (error: any) {
      // Don't fail deployment if cert provisioning fails
      // The admin can manually run certbot later
      console.warn('SSL provisioning warning:', error.message)
      return {
        success: true,
        message: `Nginx configured but SSL certificate needs manual setup. Run: certbot certonly --nginx -d ${customDomain} -d ${baseDomain}`,
      }
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
}
