#!/bin/bash

# Setup CMS subdomain for a tenant on VPS
# Usage: ./setup-cms-domain.sh myautodealer

set -e

if [ -z "$1" ]; then
    echo "Usage: ./setup-cms-domain.sh <tenant-slug>"
    echo "Example: ./setup-cms-domain.sh myautodealer"
    exit 1
fi

TENANT_SLUG=$1
VPS_IP="185.146.166.77"
VPS_USER="root"
DOMAIN="${TENANT_SLUG}-auth.autodealershipcloud.com"

echo "================================"
echo "Setting up CMS Domain"
echo "================================"
echo "Tenant: $TENANT_SLUG"
echo "Domain: $DOMAIN"
echo ""

# Step 1: Create temp HTTP nginx config
echo "[1/3] Creating temporary HTTP nginx config..."
ssh ${VPS_USER}@${VPS_IP} << EOF
cat > /etc/nginx/conf.d/cms-${TENANT_SLUG}.conf << 'NGINX_CONF'
server {
    server_name ${DOMAIN};
    listen 80;
    listen [::]:80;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
NGINX_CONF

nginx -t && nginx -s reload
echo "Nginx config created and reloaded"
EOF

# Step 2: Provision SSL certificate with Let's Encrypt
echo ""
echo "[2/3] Provisioning SSL certificate for ${DOMAIN}..."
ssh ${VPS_USER}@${VPS_IP} "certbot certonly --nginx -d ${DOMAIN} -n --agree-tos --email admin@autodealershipcloud.com"

# Step 3: Deploy full HTTPS nginx config
echo ""
echo "[3/3] Deploying full HTTPS nginx config..."
ssh ${VPS_USER}@${VPS_IP} << EOF
cat > /etc/nginx/conf.d/cms-${TENANT_SLUG}.conf << 'NGINX_CONF'
server {
    server_name ${DOMAIN};
    listen 80;
    listen [::]:80;

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;

        proxy_set_header X-Tenant-Slug ${TENANT_SLUG};
        proxy_set_header X-Original-Host \$server_name;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
NGINX_CONF

nginx -t && nginx -s reload
echo "HTTPS config deployed and nginx reloaded"
EOF

echo ""
echo "================================"
echo "Domain Setup Complete! ✓"
echo "================================"
echo ""
echo "CMS URL: https://${DOMAIN}"
echo ""
echo "Next steps:"
echo "1. Create a tenant in the admin panel with slug: ${TENANT_SLUG}"
echo "2. Create a user for that tenant"
echo "3. Visit https://${DOMAIN} and login"
echo ""
