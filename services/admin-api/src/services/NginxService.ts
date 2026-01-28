import fs from 'fs/promises';
import path from 'path';
import { generateNginxConfig } from '../utils/nginx-generator';

const NGINX_CONF_DIR = process.env.NGINX_CONF_DIR || '/etc/nginx/conf.d';

export async function generateTenantNginxConfig(
  tenantSlug: string,
  domain: string = 'autodealercloud.com'
): Promise<void> {
  try {
    const config = generateNginxConfig({
      tenantSlug,
      domain,
      cmsApiPort: 3011,
      publisherApiPort: 3012,
      dashboardPort: 3000,
    });

    const filename = `tenant-${tenantSlug}.conf`;
    const filepath = path.join(NGINX_CONF_DIR, filename);

    // Write config file
    await fs.writeFile(filepath, config, 'utf-8');
    console.log(`✓ Nginx config generated: ${filepath}`);

    // In production, reload nginx: nginx -t && nginx -s reload
    // For now, just log it
  } catch (error) {
    console.error(`Failed to generate nginx config for ${tenantSlug}:`, error);
    throw new Error(`Failed to generate nginx configuration`);
  }
}

export async function removeTenantNginxConfig(tenantSlug: string): Promise<void> {
  try {
    const filename = `tenant-${tenantSlug}.conf`;
    const filepath = path.join(NGINX_CONF_DIR, filename);

    // Only remove if it exists
    try {
      await fs.unlink(filepath);
      console.log(`✓ Nginx config removed: ${filepath}`);
    } catch (e) {
      // File doesn't exist, that's fine
    }
  } catch (error) {
    console.error(`Failed to remove nginx config for ${tenantSlug}:`, error);
  }
}

export async function reloadNginx(): Promise<boolean> {
  // In production environment running on VPS, use:
  // exec('nginx -t && nginx -s reload', callback)
  
  // For Docker environments, send SIGHUP to nginx master process
  if (process.env.NGINX_PID) {
    try {
      const pid = parseInt(process.env.NGINX_PID);
      process.kill(pid, 'SIGHUP');
      console.log(`✓ Nginx reloaded (PID: ${pid})`);
      return true;
    } catch (error) {
      console.error('Failed to reload nginx:', error);
      return false;
    }
  }

  console.log('⚠ Nginx reload would be triggered in production');
  return true;
}

export default {
  generateTenantNginxConfig,
  removeTenantNginxConfig,
  reloadNginx,
};
