#!/bin/bash
# Upload and deploy AutoDealerCloud to VPS via SCP
# Run from local machine: bash infrastructure/upload-to-vps.sh

set -e

VPS_HOST="185.146.166.77"
VPS_USER="root"
APP_DIR="/var/www/autodealercloud"
LOCAL_DIR="$(pwd)"

echo "🚀 Uploading AutoDealerCloud to VPS..."
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Create app directory on VPS
echo -e "${BLUE}Step 1: Preparing VPS directory${NC}"
ssh ${VPS_USER}@${VPS_HOST} "mkdir -p ${APP_DIR} && rm -rf ${APP_DIR}/* ${APP_DIR}/.[^.]* 2>/dev/null || true"

# Step 2: Upload entire project
echo -e "${BLUE}Step 2: Uploading project files${NC}"
scp -r ${LOCAL_DIR}/* ${VPS_USER}@${VPS_HOST}:${APP_DIR}/ --exclude node_modules --exclude .next --exclude dist --exclude .git

# Step 3: Make scripts executable
echo -e "${BLUE}Step 3: Setting up permissions${NC}"
ssh ${VPS_USER}@${VPS_HOST} "chmod +x ${APP_DIR}/infrastructure/deploy.sh"

# Step 4: Run deployment script on VPS
echo -e "${BLUE}Step 4: Running deployment script on VPS${NC}"
ssh ${VPS_USER}@${VPS_HOST} "bash ${APP_DIR}/infrastructure/deploy.sh"

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. SSH into VPS: ssh root@${VPS_HOST}"
echo "2. Update .env.production with database URL: nano ${APP_DIR}/.env.production"
echo "3. Setup database: npm run db:migrate && npm run db:seed"
echo "4. View logs: pm2 logs"
echo ""
