# VPS Deployment Instructions

## Pull Latest Changes

SSH into your VPS and run:

```bash
cd /path/to/autodealercloud
git pull origin master
```

## Install Dependencies

Run the installation script:

```bash
# For Linux/Mac
bash install.sh

# Or manually install each service:
cd services/admin-api && npm install
cd ../cms-api && npm install
cd ../publisher-api && npm install
cd ../admin-dashboard && npm install
cd ../cms-dashboard && npm install
cd ../publisher && npm install
```

## Setup Environment

```bash
cp .env.example .env.local
# Edit .env.local with your VPS settings:
# - Database credentials
# - Port numbers
# - JWT secrets
# - API URLs
```

## Create PostgreSQL Databases

```bash
sudo -u postgres psql

CREATE DATABASE admin_db;
CREATE DATABASE cms_db;
CREATE DATABASE publisher_db;

\q
```

## Start Services (using PM2 for production)

Install PM2 globally:

```bash
npm install -g pm2
```

Start all services:

```bash
pm2 start services/admin-api/src/index.ts --name admin-api
pm2 start services/cms-api/src/index.ts --name cms-api
pm2 start services/publisher-api/src/index.ts --name publisher-api

cd services/admin-dashboard && pm2 start npm --name admin-dashboard -- run dev
cd ../cms-dashboard && pm2 start npm --name cms-dashboard -- run dev
cd ../publisher && pm2 start npm --name publisher -- run dev
```

Save PM2 config:

```bash
pm2 save
pm2 startup
```

## Verify All Services

```bash
# Check compilation
cd services/admin-api && npx tsc --noEmit
cd ../cms-api && npx tsc --noEmit
cd ../publisher-api && npx tsc --noEmit
cd ../admin-dashboard && npx tsc --noEmit
cd ../cms-dashboard && npx tsc --noEmit
cd ../publisher && npx tsc --noEmit
```

## Monitor Services

```bash
pm2 status
pm2 logs
pm2 logs admin-api
```

## Nginx Configuration (Optional - for reverse proxy)

Create `/etc/nginx/sites-available/autodealercloud`:

```nginx
upstream admin_api {
  server localhost:3001;
}

upstream cms_api {
  server localhost:3002;
}

upstream publisher_api {
  server localhost:3003;
}

upstream admin_dashboard {
  server localhost:3000;
}

upstream cms_dashboard {
  server localhost:3010;
}

upstream publisher {
  server localhost:3020;
}

server {
  listen 80;
  server_name autodealercloud.com;

  location /api/admin/ {
    proxy_pass http://admin_api;
  }

  location /api/cms/ {
    proxy_pass http://cms_api;
  }

  location /api/publisher/ {
    proxy_pass http://publisher_api;
  }

  location /admin {
    proxy_pass http://admin_dashboard;
  }

  location /editor {
    proxy_pass http://cms_dashboard;
  }

  location / {
    proxy_pass http://publisher;
  }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/autodealercloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Troubleshooting

**Services won't start:**
```bash
npm run build
# Check for compilation errors
npm run dev  # Test manually first
```

**Database connection issues:**
```bash
# Test PostgreSQL connection
psql -U postgres -h localhost -d admin_db
```

**Port already in use:**
```bash
lsof -i :3001  # Check port 3001
kill -9 <PID>
```

**View service logs:**
```bash
pm2 logs admin-api
pm2 logs cms-api --lines 100
```

## Summary

✅ Pull latest code
✅ Install dependencies
✅ Configure environment
✅ Create databases
✅ Start services with PM2
✅ Verify compilation
✅ Monitor with PM2

All services are error-free and ready for production deployment!
