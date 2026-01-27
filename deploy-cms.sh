#!/bin/bash

# Deploy CMS App to VPS
# Usage: ./deploy-cms.sh

set -e

VPS_IP="185.146.166.77"
VPS_USER="root"
APP_PATH="/var/www/autodealercloud"

echo "================================"
echo "Deploying CMS App to VPS"
echo "================================"

# Step 1: Pull latest code
echo ""
echo "[1/5] Pulling latest code from GitHub..."
ssh ${VPS_USER}@${VPS_IP} "cd ${APP_PATH} && git pull origin main"

# Step 2: Install CMS dependencies
echo ""
echo "[2/5] Installing CMS dependencies..."
ssh ${VPS_USER}@${VPS_IP} "cd ${APP_PATH}/apps/cms && npm install"

# Step 3: Build CMS app
echo ""
echo "[3/5] Building CMS app..."
ssh ${VPS_USER}@${VPS_IP} "cd ${APP_PATH}/apps/cms && npm run build"

# Step 4: Stop old CMS process (if running)
echo ""
echo "[4/5] Managing PM2 processes..."
ssh ${VPS_USER}@${VPS_IP} "pm2 delete cms 2>/dev/null || true"

# Step 5: Start CMS with PM2
echo ""
echo "[5/5] Starting CMS on port 3002..."
ssh ${VPS_USER}@${VPS_IP} "cd ${APP_PATH}/apps/cms && pm2 start npm --name cms -- start -- -p 3002 && pm2 save"

echo ""
echo "================================"
echo "CMS Deployment Complete! ✓"
echo "================================"
echo ""
echo "CMS URL (once configured):"
echo "  https://{tenantSlug}-auth.autodealershipcloud.com"
echo ""
echo "Monitor logs:"
echo "  ssh ${VPS_USER}@${VPS_IP} 'pm2 logs cms'"
echo ""
echo "Check status:"
echo "  ssh ${VPS_USER}@${VPS_IP} 'pm2 status'"
