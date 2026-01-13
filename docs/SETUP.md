# Production Setup Guide

## Server Requirements

- **OS**: AlmaLinux 2+
- **PHP**: 8.1+
- **Node.js**: 18+
- **PostgreSQL**: 13+
- **Nginx**: Latest stable
- **Memory**: Minimum 4GB RAM

## Installation Steps

### 1. Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/shamitech/autodealercloud.git
cd autodealercloud
sudo chown -R www-data:www-data .
```

### 2. Backend Setup

```bash
cd api
composer install --no-dev --optimize-autoloader

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Database setup
php artisan migrate --force
php artisan db:seed --class=ProductionSeeder
```

### 3. Frontend Build

```bash
cd ../dashboard
npm install
npm run build

# Output goes to dist/ for Nginx serving
```

### 4. Nginx Configuration

The nginx configuration files are stored separately on the server at `/var/www/autodealercloud/nginx/`. To update the Nginx config:

```bash
# Validate your nginx config
sudo nginx -t

# Reload Nginx after making changes
sudo systemctl reload nginx
```

### 5. SSL Certificate

```bash
sudo certbot certonly --nginx \
  -d autodealercloud.app \
  -d '*.autodealercloud.app'
```

### 6. Set Permissions

```bash
sudo chmod -R 755 storage bootstrap/cache
sudo chown -R www-data:www-data storage bootstrap/cache
```

### 7. Start Services

```bash
# PHP-FPM
sudo systemctl start php-fpm
sudo systemctl enable php-fpm

# Nginx
sudo systemctl enable nginx

# Redis (if using)
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## Ongoing Maintenance

### Daily Tasks

- Monitor error logs
- Check disk space
- Verify Lightspeed sync

### Weekly Tasks

- Update composer packages: `composer update`
- Clear cache: `php artisan cache:clear`
- Run maintenance jobs

### Monthly Tasks

- SSL certificate renewal check
- Database optimization
- Backup verification

## Deployment

Use CI/CD pipeline (GitHub Actions recommended):

1. Test on push
2. Build on merge to main
3. Deploy to staging
4. Manual approval
5. Deploy to production

See `.github/workflows/` for pipeline configuration.

## Troubleshooting

### 502 Bad Gateway

Check PHP-FPM is running:
```bash
sudo systemctl status php-fpm
```

### Permission Denied

Ensure www-data owns storage:
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
```

### Database Connection Error

Verify PostgreSQL is running and credentials are correct:
```bash
psql -h localhost -U autodealercloud -d autodealercloud
```
