export function generateNginxConfig(tenantSlug: string, domain: string): string {
  const serverName = `${tenantSlug}.${domain}`;
  
  return `
upstream cms_api_${tenantSlug} {
  server cms-api:3001;
}

upstream admin_api_${tenantSlug} {
  server admin-api:3000;
}

server {
  listen 80;
  server_name ${serverName};
  
  client_max_body_size 10M;
  
  location /api/cms {
    proxy_pass http://cms_api_${tenantSlug};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  
  location /api/admin {
    proxy_pass http://admin_api_${tenantSlug};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  
  location / {
    # Serve publisher content
    proxy_pass http://publisher:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
`;
}

export async function writeNginxConfig(tenantSlug: string, domain: string, configPath: string, fs: any): Promise<void> {
  const config = generateNginxConfig(tenantSlug, domain);
  const fileName = `${tenantSlug}-${domain}.conf`;
  const fullPath = `${configPath}/${fileName}`;
  
  await fs.writeFile(fullPath, config, 'utf8');
}
