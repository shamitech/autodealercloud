# VPS Deployment Guide - AutoDealerCloud

## Prerequisites
- VPS with Ubuntu 22.04 LTS (tested on 185.146.166.77)
- 4GB+ RAM, 2+ CPU cores
- 50GB+ SSD storage
- Docker & Docker Compose installed
- Nginx installed (for reverse proxy)
- Git installed

## Infrastructure Setup

### 1. Server Preparation

```bash
# SSH into VPS
ssh root@185.146.166.77

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER
newgrp docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### 2. Project Directory Setup

```bash
# Clone repository
cd /var/www
git clone https://github.com/shamitech/autodealercloud.git
cd autodealercloud

# Create required directories
mkdir -p /var/www/autodealercloud/data/postgres-admin
mkdir -p /var/www/autodealercloud/data/postgres-cms
mkdir -p /var/www/autodealercloud/data/postgres-publisher
mkdir -p /var/www/autodealercloud/logs

# Set permissions
chmod -R 755 /var/www/autodealercloud
```

### 3. Environment Configuration

```bash
# Create .env file in project root
cat > /var/www/autodealercloud/.env << 'EOF'
# Database
POSTGRES_USER=autodealercloud
POSTGRES_PASSWORD=SecurePassword123!
POSTGRES_HOST=localhost

# Admin API
ADMIN_API_PORT=3010
ADMIN_DATABASE=admin_db
ADMIN_DB_PORT=5432

# CMS API
CMS_API_PORT=3011
CMS_DATABASE=cms_db
CMS_DB_PORT=5433

# Publisher API
PUBLISHER_API_PORT=3012
PUBLISHER_DATABASE=publisher_db
PUBLISHER_DB_PORT=5434

# Shared
INTERNAL_SECRET=your-internal-secret-key-here
DOMAIN=autodealercloud.com
NODE_ENV=production
JWT_SECRET=your-jwt-secret-key-here-change-in-production

# Nginx
NGINX_CONF_DIR=/etc/nginx/conf.d
EOF
```

### 4. Start Services with Docker Compose

```bash
# Navigate to project directory
cd /var/www/autodealercloud

# Build images (first time only)
docker-compose build

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f admin-api    # Admin API logs
docker-compose logs -f cms-api      # CMS API logs
docker-compose logs -f publisher-api # Publisher API logs
```

### 5. Nginx Configuration

```bash
# Copy Nginx config
sudo cp /var/www/autodealercloud/docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

### 6. SSL/TLS Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate certificates
sudo certbot certonly --nginx -d autodealercloud.com -d "*.autodealercloud.com" -d admin.autodealercloud.com

# Auto-renewal
sudo systemctl enable certbot.timer

# Manual renewal (if needed)
sudo certbot renew --dry-run
```

## Database Initialization

### 1. Run Migrations

```bash
# The migrations run automatically on first start
# To manually run them:

docker exec autodealercloud-admin-api npm run migrate

# Verify database created
docker exec autodealercloud-postgres-admin psql -U autodealercloud -d admin_db -c "\\dt"
```

### 2. Seed Admin User

```bash
# Create first admin user
docker exec autodealercloud-admin-api npm run seed

# Output will show: Admin user created: admin@autodealercloud.com with temp password
```

## Service Access

| Service | URL | Port |
|---------|-----|------|
| Admin Dashboard | https://admin.autodealercloud.com | 443 |
| Admin API | http://localhost:3010/api | 3010 |
| CMS Dashboard (per tenant) | https://cms.{tenant}.autodealercloud.com | 443 |
| CMS API | http://localhost:3011/api | 3011 |
| Public Site (per tenant) | https://{tenant}.autodealercloud.com | 443 |
| Publisher API | http://localhost:3012/api | 3012 |

## First Tenant Creation

### 1. Login to Admin Dashboard
- URL: https://admin.autodealercloud.com
- Email: admin@autodealercloud.com
- Password: Use the temporary password from seed

### 2. Create New Tenant
1. Navigate to "Tenants" section
2. Click "Create Tenant"
3. Fill in:
   - Company Name: "Example Dealership"
   - Subdomain: "example-dealership"
   - Email: "contact@example.com"
   - Contact details

4. System will:
   - Create tenant record in admin database
   - Provision CMS database schema
   - Generate Nginx configuration
   - Reload Nginx

5. Temporary password will be displayed - share with tenant

### 3. Tenant Login
- URL: https://cms.example-dealership.autodealercloud.com
- Email: contact@example.com
- Password: (temporary password from creation)

## Monitoring & Maintenance

### Check Service Status
```bash
cd /var/www/autodealercloud
docker-compose ps
docker-compose logs admin-api      # View admin API logs
docker-compose logs cms-api        # View CMS API logs
docker-compose logs publisher-api  # View publisher API logs
```

### Database Backups
```bash
# Backup all databases
./scripts/backup-databases.sh

# Restore from backup
./scripts/restore-databases.sh backup-file.tar.gz
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart admin-api

# Restart with rebuild
docker-compose down
docker-compose up -d --build
```

## Security Best Practices

1. **Change default credentials** immediately after setup
2. **Use strong passwords** for all accounts
3. **Enable firewall** on VPS:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
4. **Regular backups** - set up automated backups
5. **Monitor logs** - check for suspicious activity
6. **Keep updated** - run `git pull` and `docker-compose build` regularly

## Troubleshooting

### Services won't start
```bash
# Check Docker logs
docker-compose logs
# Verify ports are available
sudo netstat -tlnp | grep -E ':(3010|3011|3012|5432|5433|5434)'
```

### Database connection errors
```bash
# Verify database is running
docker-compose ps postgres-admin

# Check database logs
docker-compose logs postgres-admin

# Connect to database manually
docker exec -it autodealercloud-postgres-admin psql -U autodealercloud -d admin_db
```

### Nginx configuration issues
```bash
# Test Nginx config
sudo nginx -t

# View Nginx error log
sudo tail -f /var/log/nginx/error.log

# Reload Nginx
sudo systemctl reload nginx
```

## Production Checklist

- [ ] Change all default passwords
- [ ] Set up SSL/TLS certificates
- [ ] Configure automated backups
- [ ] Enable firewall rules
- [ ] Set up monitoring/alerts
- [ ] Configure log rotation
- [ ] Test failover procedures
- [ ] Document tenant onboarding process
- [ ] Set up status page monitoring
- [ ] Train team on deployment/management

## Support & Additional Resources

- GitHub: https://github.com/shamitech/autodealercloud
- API Documentation: See individual service README files
- Issues: https://github.com/shamitech/autodealercloud/issues
