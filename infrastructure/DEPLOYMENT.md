# AutoDealerCloud Deployment Guide

## Overview

This guide covers deploying AutoDealerCloud to your VPS using Docker and Docker Compose.

## Prerequisites

- VPS with Ubuntu 20.04 or later
- Docker & Docker Compose installed
- PostgreSQL 14+ (or use Docker)
- Node.js 18+ (for local development)
- SSL certificates from Let's Encrypt

## Deployment Steps

### 1. Clone Repository

```bash
cd /var/www
git clone <your-repo-url> autodealercloud
cd autodealercloud
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with production values
nano .env
```

Key variables to update:
- `DATABASE_URL` - Production PostgreSQL connection
- `JWT_SECRET` - Strong random secret
- `API_URL` - Your production API URL
- SMTP settings for email notifications
- AWS S3 credentials (if using S3)

### 3. Set Up SSL Certificates

Using Let's Encrypt with Certbot:

```bash
sudo apt-get install certbot python3-certbot-nginx

# For main domain
sudo certbot certonly --standalone -d autodealercloud.com -d www.autodealercloud.com -d admin.autodealercloud.com -d api.autodealercloud.com

# Certificates will be in /etc/letsencrypt/live/autodealercloud.com/
```

### 4. Build and Start Containers

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 5. Database Setup

```bash
# Run migrations
docker-compose exec api npm run db:migrate

# Seed initial data
docker-compose exec api npm run db:seed
```

### 6. Configure Nginx Reverse Proxy

Update Nginx configuration to use SSL:

```bash
# Update /etc/nginx/conf.d/default.conf with SSL settings
```

Reload Nginx:

```bash
systemctl reload nginx
```

### 7. Set Up Auto-Renewal for SSL

```bash
# Create renewal script
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Monitoring

### View Logs

```bash
# API logs
docker-compose logs api

# All services
docker-compose logs -f
```

### Health Checks

```bash
# API health
curl http://api.autodealercloud.com/health

# Check database connection
docker-compose exec api npm run db:check
```

## Scaling

### Horizontal Scaling

To run multiple instances of a service:

```bash
# Scale API service to 3 instances
docker-compose up -d --scale api=3
```

### Load Balancing

Configure Nginx upstream blocks for load balancing across multiple instances.

## Backup & Recovery

### Database Backups

```bash
# Daily backups
0 2 * * * docker-compose exec -T postgres pg_dump -U autodealercloud autodealercloud > /backups/db-$(date +\%Y\%m\%d).sql
```

### Restore from Backup

```bash
docker-compose exec -T postgres psql -U autodealercloud autodealercloud < /backups/db-backup.sql
```

## Maintenance

### Update Docker Images

```bash
git pull origin master
docker-compose build --no-cache
docker-compose up -d
```

### Clean Up

```bash
# Remove old containers and images
docker-compose down
docker system prune -a
```

## Troubleshooting

### Container Won't Start

```bash
docker-compose logs api  # View error logs
```

### Database Connection Issues

```bash
docker-compose exec api npm run db:check
```

### Nginx Issues

```bash
nginx -t  # Test configuration
systemctl restart nginx
```

## Security Best Practices

1. **Keep secrets secure** - Use environment variables, never commit .env
2. **Use strong JWT secrets** - Generate with `openssl rand -base64 32`
3. **Enable HTTPS** - Always use SSL in production
4. **Regular backups** - Automated daily database backups
5. **Monitor logs** - Set up log aggregation
6. **Update dependencies** - Regular security updates for Docker images
7. **Restrict access** - Use firewall rules for sensitive endpoints
8. **API rate limiting** - Implement to prevent abuse

---

For more help, contact: support@autodealercloud.com
