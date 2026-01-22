# AutoDealerCloud - Project Map

## Directory Structure

```
autodealercloud/
├── docker-compose.yml          # Main orchestration file
├── package.json                # Root package (for scripts)
├── README.md                   # Project documentation
├── .env                        # Environment variables (Docker)
├── .env.example                # Example env file
├── .gitignore                  # Git ignore rules
│
├── services/
│   ├── admin-api/              # Admin backend (Express + TypeScript)
│   │   ├── src/
│   │   │   └── index.ts        # Main server file
│   │   ├── dist/               # Compiled JavaScript (generated)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── admin-dashboard/        # Admin frontend (Next.js)
│   │   ├── app/
│   │   │   └── page.tsx        # Home page
│   │   ├── public/             # Static assets
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── Dockerfile
│   │
│   ├── cms-api/                # CMS backend (Express + TypeScript)
│   │   ├── src/
│   │   │   └── index.ts        # Main server file
│   │   ├── dist/               # Compiled JavaScript (generated)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── cms-dashboard/          # CMS frontend (Next.js)
│   │   ├── app/
│   │   │   └── page.tsx        # Home page
│   │   ├── public/             # Static assets
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── Dockerfile
│   │
│   ├── publisher-api/          # Publisher backend (Express + TypeScript)
│   │   ├── src/
│   │   │   └── index.ts        # Main server file
│   │   ├── dist/               # Compiled JavaScript (generated)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   └── publisher/              # Publisher frontend (Next.js)
│       ├── app/
│       │   └── page.tsx        # Home page
│       ├── public/             # Static assets
│       ├── package.json
│       ├── next.config.js
│       └── Dockerfile
│
├── shared/                     # Shared code (future)
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Shared utility functions
│
└── database/                   # Database migrations & schemas
    └── migrations/             # SQL migration files (future)
```

## Service Ports & URLs

| Service | Port | Internal URL | External URL |
|---------|------|--------------|--------------|
| **Admin API** | 3010 | http://admin-api:3010 | http://localhost:3010 |
| **Admin Dashboard** | 3011 | http://admin-dashboard:3000 | http://localhost:3011 |
| **CMS API** | 3020 | http://cms-api:3020 | http://localhost:3020 |
| **CMS Dashboard** | 3021 | http://cms-dashboard:3000 | http://localhost:3021 |
| **Publisher API** | 3030 | http://publisher-api:3030 | http://localhost:3030 |
| **Publisher Frontend** | 3031 | http://publisher:3000 | http://localhost:3031 |
| **Admin DB** | 5434 | postgres-admin:5432 | localhost:5434 |
| **CMS DB** | 5435 | postgres-cms:5432 | localhost:5435 |
| **Publisher DB** | 5436 | postgres-publisher:5432 | localhost:5436 |

## Database Schemas

### Admin DB (admin_db)
- `admin_users` - Platform admins
- `tenants` - Dealership companies
- `tenant_dms_credentials` - Lightspeed DMS credentials per tenant
- `audit_logs` - Admin activity logs

### CMS DB (cms_db)
- `tenants` - Tenant reference
- `tenant_users` - Tenant admins/editors
- `components` - Reusable modules (Atoms)
- `organisms` - Grouped components (Molecules)
- `pages` - CMS pages built from components
- `dms_lightspeed_config` - Tenant Lightspeed credentials
- `vehicles` - Vehicle inventory (synced from DMS)

### Publisher DB (publisher_db)
- `published_pages` - Snapshots of published pages

## Development Workflow

### Local Development
```bash
# Start all services
docker-compose up

# Services available at:
# Admin Dashboard: http://localhost:3011
# CMS Dashboard: http://localhost:3021
# Publisher: http://localhost:3031
```

### Adding Features
1. Edit backend code in `services/[service]/src/`
2. TypeScript compiles to `dist/` on build
3. Changes require Docker rebuild: `docker-compose build [service]`
4. Restart service: `docker-compose up -d [service]`

### Frontend Development
1. Edit Next.js code in `services/[dashboard]/app/`
2. Hot-reload works in development
3. Build for production: `npm run build`

## Next Steps (By Priority)

1. **Admin Backend API** - Tenant CRUD, user provisioning, temp passwords
2. **CMS Backend API** - Component/page management, DMS integration
3. **Publisher Backend API** - Page serving, publish workflow
4. **Admin Dashboard** - Tenant management UI
5. **CMS Dashboard** - Page builder UI + component system
6. **Publisher Frontend** - Public page rendering
7. **Tenant Provisioning** - Automated setup workflow
8. **DMS Lightspeed** - Credential storage & vehicle sync
9. **Nginx Configuration** - Dynamic subdomain routing
10. **VPS Deployment** - Full stack on production

## Key Features to Implement

### Authentication
- [ ] JWT-based auth for all services
- [ ] Temp password flow for new tenants
- [ ] Session management

### Tenant Management
- [ ] Create tenant (Admin)
- [ ] Assign admin user (email-based)
- [ ] Generate temp password
- [ ] Auto-provision database schema

### Page Builder
- [ ] Atom (component) creation
- [ ] Molecule (organism) composition
- [ ] Page building from components
- [ ] Save/publish workflow

### DMS Integration (Lightspeed)
- [ ] Store encrypted credentials
- [ ] Sync vehicle inventory
- [ ] Display vehicles in builder

### Publishing
- [ ] Snapshot pages to Publisher DB
- [ ] Auto-generate nginx configs
- [ ] Deploy to tenant-pub subdomain

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Backend API** | Express, Node.js 18, TypeScript |
| **Database** | PostgreSQL 15 |
| **Container** | Docker, Docker Compose |
| **Web Server** | Nginx (on VPS) |
| **Authentication** | JWT |

## Important Notes

- All services use TypeScript for type safety
- Three separate databases for data isolation
- Shared `/shared` folder for common code/types
- All code is containerized for easy deployment
- Environment-specific configs via .env files
- VPS deployment at: `/var/www/autodealercloud`
- Nginx configs at: `/etc/nginx/conf.d/`
