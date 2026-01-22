# AutoDealerCloud - Multi-Tenant SaaS CMS

A comprehensive SaaS platform for auto dealerships to manage their digital presence through a visual page builder.

## Architecture

```
Three Services:
├── Admin Dashboard (admin.autodealercloud.com) - Manage tenants
├── CMS Dashboard (tenant.autodealercloud.com) - Build pages  
└── Publisher (tenant-pub.autodealercloud.com) - Public website

Three Databases:
├── Admin DB - Platform management
├── CMS DB - Tenant content
└── Publisher DB - Published pages
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Development

```bash
# Copy environment file
cp .env.example .env

# Start all services with Docker Compose
docker-compose up -d

# Wait for services to start, then:
# - Admin Dashboard: http://localhost:3011
# - CMS Dashboard: http://localhost:3021
# - Publisher: http://localhost:3031

# Admin API: http://localhost:3010
# CMS API: http://localhost:3020
# Publisher API: http://localhost:3030
```

## Services

### Admin API (Port 3010)
- Tenant management
- User provisioning
- Platform configuration

### CMS API (Port 3020)
- Component/module management
- Page building
- Tenant content management

### Publisher API (Port 3030)
- Publish page snapshots
- Serve published pages

## Database Schema

See `/database` folder for migrations and schema documentation.

## Deployment

Deployed on VPS at `/var/www/autodealercloud`

```bash
cd /var/www/autodealercloud
git pull origin master
docker-compose build
docker-compose up -d
```
