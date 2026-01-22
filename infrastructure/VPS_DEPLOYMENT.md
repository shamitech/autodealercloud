# VPS Deployment Guide

## Quick Start

### Option 1: One-Command Deployment (Recommended)
```bash
ssh root@185.146.166.77 "bash -s" < infrastructure/deploy.sh
```

### Option 2: Manual Deployment

1. **SSH into VPS:**
   ```bash
   ssh root@185.146.166.77
   ```

2. **Clone Repository:**
   ```bash
   cd /var/www
   git clone https://github.com/your-org/autodealercloud.git
   cd autodealercloud
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   npm run db:generate
   ```

4. **Configure Environment:**
   ```bash
   cp .env.example .env.production
   nano .env.production  # Edit with your database URL, JWT secret, etc.
   ```

5. **Setup Database (if PostgreSQL available):**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Install and Start with PM2:**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.json --env production
   pm2 save
   pm2 startup
   ```

## Services & Ports

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Marketing Site | 3000 | https://autodealercloud.com | ✅ Configured |
| Admin Panel | 3001 | https://admin.autodealercloud.com | ✅ Configured |
| Tenant CMS | 3002 | https://{tenant}-auth.autodealercloud.com | ✅ Configured |
| API | 3004 | https://api.autodealercloud.com | ✅ Configured |

## Configuration Files

### Environment Variables (.env.production)
```
DATABASE_URL=postgresql://user:password@localhost:5432/autodealercloud
JWT_SECRET=<generate-with-openssl-rand-base64-32>
API_PORT=3004
API_HOST=0.0.0.0
NODE_ENV=production
```

### PM2 Process Management
```bash
# View all processes
pm2 list

# View logs
pm2 logs api
pm2 logs marketing-site

# Restart all services
pm2 restart all

# Stop all services
pm2 stop all

# Start all services
pm2 start ecosystem.config.json

# Delete all processes
pm2 delete all
```

### Nginx Configuration
All Nginx configs are in `/etc/nginx/conf.d/`:
- `marketing-site.conf` - Marketing homepage
- `admin-panel.conf` - Admin dashboard  
- `api.conf` - API reverse proxy
- `tenant.conf` - Multi-tenant CMS environments

```bash
# Verify Nginx syntax
nginx -t

# Reload Nginx
systemctl reload nginx

# View Nginx status
systemctl status nginx
```

### SSL Certificates
SSL is automatically managed by Let's Encrypt with Certbot:

```bash
# Check certificate status
certbot certificates

# Renew certificates manually
certbot renew

# Auto-renewal is configured via systemd timer
systemctl status certbot.timer
```

## Database Setup

### PostgreSQL on VPS
```bash
# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql << EOF
CREATE USER autodealercloud WITH PASSWORD 'secure_password';
CREATE DATABASE autodealercloud OWNER autodealercloud;
GRANT ALL PRIVILEGES ON DATABASE autodealercloud TO autodealercloud;
EOF

# Update .env.production with connection string:
# DATABASE_URL="postgresql://autodealercloud:secure_password@localhost:5432/autodealercloud"

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### SQLite (Development)
By default uses SQLite locally. For VPS production, switch to PostgreSQL.

## Monitoring

### Check Application Status
```bash
# API health check
curl https://api.autodealercloud.com/health

# View PM2 logs
pm2 logs

# Check VPS resources
top
free -h
df -h
```

### Logs Location
- PM2 logs: `/var/log/autodealercloud/`
- Nginx access: `/var/log/nginx/access.log`
- Nginx error: `/var/log/nginx/error.log`

## Troubleshooting

### Services not starting
```bash
# Check PM2 status
pm2 list

# View error logs
pm2 logs --err

# Check ports in use
lsof -i :3000
lsof -i :3004
```

### Database connection issues
```bash
# Test database connection
psql postgresql://user:password@localhost:5432/autodealercloud

# Check Prisma client
npm run db:generate
```

### Nginx not routing traffic
```bash
# Test Nginx config
nginx -t

# Check Nginx status
systemctl status nginx

# View Nginx error log
tail -f /var/log/nginx/error.log
```

## Scaling Tips

### Run Multiple API Instances
Edit `ecosystem.config.json`:
```json
{
  "name": "api",
  "instances": 4,  // Change from 2 to 4 or more
  "exec_mode": "cluster"
}
```

Then restart:
```bash
pm2 restart api
```

### Enable Nginx Load Balancing
Already configured in `/etc/nginx/conf.d/api.conf` with upstream backend.

### Monitor with PM2 Plus (Optional)
```bash
pm2 install pm2-auto-pull  # Auto-deploy on git push
pm2 install pm2-logrotate  # Rotate logs automatically
```

## Backup & Recovery

### Backup Database
```bash
pg_dump -U autodealercloud autodealercloud > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
psql -U autodealercloud autodealercloud < backup_20260122.sql
```

### Backup Application Files
```bash
tar -czf autodealercloud_backup_$(date +%Y%m%d).tar.gz /var/www/autodealercloud
```

## Security Checklist

- [ ] Update `.env.production` with strong JWT_SECRET
- [ ] Set secure database password
- [ ] Enable SSH key authentication (disable password auth)
- [ ] Configure firewall (ufw)
- [ ] Enable HTTPS/SSL (auto-configured by deploy script)
- [ ] Set up regular database backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep Node.js and dependencies updated

## Support

For issues or questions:
1. Check logs: `pm2 logs`
2. Verify configuration: `nginx -t`
3. Test endpoints: `curl https://api.autodealercloud.com/health`
4. Review this guide

---
**Last Updated:** January 22, 2026
**Deployed Services:** 4 (Marketing, Admin, CMS, API)
**Nginx Status:** ✅ Active
**SSL:** ✅ Let's Encrypt
