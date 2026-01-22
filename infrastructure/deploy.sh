#!/bin/bash

# AutoDealerCloud VPS Deployment Script
# Run on VPS: curl https://raw.githubusercontent.com/<org>/autodealercloud/main/infrastructure/deploy.sh | bash
# Or: bash deploy.sh from VPS after cloning repo

set -e

echo "🚀 AutoDealerCloud Deployment Started"
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/your-org/autodealercloud.git"
APP_DIR="/var/www/autodealercloud"
NODE_VERSION="24"
DOMAIN="autodealercloud.com"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root"
   exit 1
fi

# Step 1: Install Node.js if not present
echo -e "${BLUE}Step 1: Checking Node.js${NC}"
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash -
    apt-get install -y nodejs
else
    NODE_VER=$(node -v)
    echo -e "${GREEN}✓ Node.js $NODE_VER already installed${NC}"
fi

# Step 2: Install PM2 globally
echo -e "${BLUE}Step 2: Installing PM2${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup
    pm2 save
else
    echo -e "${GREEN}✓ PM2 already installed${NC}"
fi

# Step 3: Clone or update repository
echo -e "${BLUE}Step 3: Setting up repository${NC}"
if [ -d "$APP_DIR" ]; then
    echo "Repository exists at $APP_DIR, pulling latest changes..."
    cd $APP_DIR
    git pull origin main
else
    echo "Cloning repository to $APP_DIR..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Step 4: Install dependencies
echo -e "${BLUE}Step 4: Installing dependencies${NC}"
npm install
npm run db:generate

# Step 5: Set up environment variables
echo -e "${BLUE}Step 5: Configuring environment${NC}"
if [ ! -f "$APP_DIR/.env.production" ]; then
    cat > "$APP_DIR/.env.production" << EOF
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/autodealercloud"

# JWT
JWT_SECRET="$(openssl rand -base64 32)"

# API
API_PORT=3004
API_HOST=0.0.0.0

# Node Environment
NODE_ENV=production
EOF
    echo "⚠️  Created .env.production - PLEASE UPDATE DATABASE_URL and other secrets!"
    echo "   Location: $APP_DIR/.env.production"
else
    echo -e "${GREEN}✓ .env.production already exists${NC}"
fi

# Step 6: Setup SSL with Let's Encrypt (if certbot not already run)
echo -e "${BLUE}Step 6: Setting up SSL certificates${NC}"
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "Installing Certbot..."
    apt-get install -y certbot python3-certbot-nginx
    
    echo "Requesting SSL certificate for $DOMAIN..."
    certbot certonly --nginx \
        -d $DOMAIN \
        -d "admin.$DOMAIN" \
        -d "api.$DOMAIN" \
        --non-interactive \
        --agree-tos \
        -m admin@$DOMAIN
else
    echo -e "${GREEN}✓ SSL certificates already configured${NC}"
fi

# Step 7: Start applications with PM2
echo -e "${BLUE}Step 7: Starting applications with PM2${NC}"
cd $APP_DIR

# Stop existing apps
pm2 delete all 2>/dev/null || true

# Start all services using Turbo
pm2 start npm --name "autodealercloud" -- run dev --filter="@autodealercloud/*"

# Alternative: Start individual services
# pm2 start "npm run dev --workspace=@autodealercloud/marketing-site" --name "marketing-site"
# pm2 start "npm run dev --workspace=@autodealercloud/admin-panel" --name "admin-panel"
# pm2 start "npm run dev --workspace=@autodealercloud/tenant-cms" --name "tenant-cms"
# pm2 start "npm run dev --workspace=@autodealercloud/api" --name "api"

# Save PM2 process list
pm2 save

echo -e "${GREEN}✓ Applications started${NC}"

# Step 8: Verify services
echo -e "${BLUE}Step 8: Verifying services${NC}"
sleep 3
curl -s http://localhost:3004/health > /dev/null && echo -e "${GREEN}✓ API health check passed${NC}" || echo -e "${YELLOW}⚠️  API not responding yet${NC}"

# Step 9: Setup auto-restart on reboot
echo -e "${BLUE}Step 9: Configuring auto-restart${NC}"
pm2 startup -u root --hp /root
pm2 save

# Step 10: Verify Nginx
echo -e "${BLUE}Step 10: Verifying Nginx configuration${NC}"
nginx -t && echo -e "${GREEN}✓ Nginx configuration valid${NC}" || echo -e "${YELLOW}⚠️  Nginx syntax error${NC}"
systemctl reload nginx

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "📍 Your application is now running:"
echo "   🌍 Marketing Site: https://$DOMAIN"
echo "   👨‍💼 Admin Panel: https://admin.$DOMAIN"
echo "   ⚡ API: https://api.$DOMAIN"
echo ""
echo "📊 View logs:"
echo "   pm2 logs"
echo ""
echo "⚙️  Manage processes:"
echo "   pm2 list"
echo "   pm2 restart all"
echo "   pm2 stop all"
echo ""
echo "🔐 SSL auto-renewal (automatic):"
echo "   systemctl status certbot.timer"
echo ""
echo "📝 Next steps:"
echo "   1. Update .env.production with your database URL"
echo "   2. Run 'npm run db:migrate' to set up database"
echo "   3. Run 'npm run db:seed' to add initial data"
echo "   4. Configure custom domains as needed"
echo ""
