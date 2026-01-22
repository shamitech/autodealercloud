export interface NginxConfig {
  tenantSlug: string;
  domain: string;
  cmsApiPort: number;
  publisherApiPort: number;
  dashboardPort: number;
}

export function generateNginxConfig(config: NginxConfig): string {
  const { tenantSlug, domain, publisherApiPort } = config;
  const subdomain = `${tenantSlug}.${domain}`;

  return `
# AutoDealerCloud - ${tenantSlug} Tenant
# Generated configuration for ${subdomain}
# This file is auto-generated, do not edit manually

upstream publisher_${tenantSlug} {
  server publisher-api:${publisherApiPort};
}

server {
  listen 80;
  listen [::]:80;
  server_name ${subdomain} www.${subdomain};

  # Redirect HTTP to HTTPS (when SSL is configured)
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name ${subdomain} www.${subdomain};

  # SSL certificates (configure with Let's Encrypt)
  # ssl_certificate /etc/letsencrypt/live/${subdomain}/fullchain.pem;
  # ssl_certificate_key /etc/letsencrypt/live/${subdomain}/privkey.pem;

  client_max_body_size 50M;
  gzip on;
  gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

  # Root for public content
  root /var/www/autodealercloud/public;
  index index.html index.htm;

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "no-referrer-when-downgrade" always;

  # Proxy to Publisher API (frontend)
  location / {
    proxy_pass http://publisher_${tenantSlug};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }

  # Static files caching
  location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}

# Admin subdomain (shared across all tenants)
upstream admin_dashboard {
  server admin-dashboard:3000;
}

server {
  listen 80;
  listen [::]:80;
  server_name admin.${domain} www.admin.${domain};
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name admin.${domain} www.admin.${domain};

  # SSL certificates
  # ssl_certificate /etc/letsencrypt/live/admin.${domain}/fullchain.pem;
  # ssl_certificate_key /etc/letsencrypt/live/admin.${domain}/privkey.pem;

  client_max_body_size 50M;
  gzip on;

  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;

  location / {
    proxy_pass http://admin_dashboard;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }

  location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}

# CMS subdomain (per tenant)
upstream cms_${tenantSlug} {
  server cms-dashboard:3001;
}

server {
  listen 80;
  listen [::]:80;
  server_name cms.${subdomain} www.cms.${subdomain};
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name cms.${subdomain} www.cms.${subdomain};

  # SSL certificates
  # ssl_certificate /etc/letsencrypt/live/cms.${subdomain}/fullchain.pem;
  # ssl_certificate_key /etc/letsencrypt/live/cms.${subdomain}/privkey.pem;

  client_max_body_size 50M;
  gzip on;

  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;

  location / {
    proxy_pass http://cms_${tenantSlug};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }

  location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
`;
}

export function generateNginxMainConfig(domain: string): string {
  return `
# AutoDealerCloud - Main Nginx Configuration
# This file loads all tenant configurations

user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
  worker_connections 2048;
  use epoll;
  multi_accept on;
}

http {
  # Basic Settings
  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  types_hash_max_size 2048;
  server_tokens off;

  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  # Logging
  access_log /var/log/nginx/access.log;
  error_log /var/log/nginx/error.log;

  # Gzip Settings
  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

  # Virtual Host Configs
  include /etc/nginx/conf.d/*.conf;
  include /etc/nginx/sites-enabled/*;
}
`;
}

export default {
  generateNginxConfig,
  generateNginxMainConfig,
};
