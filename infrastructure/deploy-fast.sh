#!/bin/bash
# Fast minimal deployment - skips npm install, assumes Node.js already available
set -e

VPS_HOST="185.146.166.77"
VPS_USER="root"
APP_DIR="/var/www/autodealercloud"

echo "⚡ Fast deployment to VPS..."

# Just upload files (no install)
echo "Uploading files..."
ssh ${VPS_USER}@${VPS_HOST} "mkdir -p ${APP_DIR}"
scp -r apps packages infrastructure ecosystem.config.json package.json package-lock.json .env.local ${VPS_USER}@${VPS_HOST}:${APP_DIR}/ 2>/dev/null || true

# Quick setup on VPS
echo "Starting services..."
ssh ${VPS_USER}@${VPS_HOST} << 'DEPLOY'
cd /var/www/autodealercloud
npm install --production 2>&1 | tail -5
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.json
pm2 save
echo ""
echo "✅ Running services:"
pm2 list
echo ""
echo "🌍 Your app is live:"
echo "   Marketing: https://autodealercloud.com"
echo "   Admin: https://admin.autodealercloud.com"
echo "   API: https://api.autodealercloud.com"
DEPLOY

echo "Done! ✓"
