# Project Setup Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 14+ (or use Docker)
- Docker & Docker Compose (optional, for containerized setup)

## Installation

### 1. Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo and all workspaces.

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your local development settings:

```env
DATABASE_URL="postgresql://localhost/autodealercloud"
JWT_SECRET="your-dev-secret-key"
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

## Development

### Run All Services in Development

```bash
npm run dev
```

This starts:
- **Marketing Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3001
- **Tenant CMS**: http://localhost:3002
- **API**: http://localhost:3004

### Run Individual Services

```bash
# Marketing site only
cd apps/marketing-site && npm run dev

# Admin panel only
cd apps/admin-panel && npm run dev

# Tenant CMS only
cd apps/tenant-cms && npm run dev

# API only
cd apps/api && npm run dev
```

## Building

```bash
# Build all apps
npm run build

# Build specific app
cd apps/api && npm run build
```

## Type Checking

```bash
# Check types across monorepo
npm run type-check
```

## Linting

```bash
# Lint all files
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## Testing

```bash
# Run tests
npm run test
```

## Project Structure

```
autodealercloud/
├── apps/
│   ├── marketing-site/          # Public marketing site
│   ├── admin-panel/             # Admin dashboard
│   ├── tenant-cms/              # Multi-tenant CMS
│   └── api/                     # Fastify backend
├── packages/
│   ├── database/                # Prisma schemas
│   ├── shared-components/       # Component library
│   ├── ui-kit/                  # React components
│   └── types/                   # TypeScript types
├── infrastructure/
│   ├── docker/                  # Docker configurations
│   └── nginx/                   # Nginx configs
└── docs/                        # Documentation
```

## Key Concepts

### Multi-Tenant Architecture

- Each tenant has isolated data in the database (row-level security)
- Tenants access their CMS via subdomain: `{tenant-slug}-auth.autodealercloud.com`
- Published sites are served from: `{tenant-slug}-pub.autodealercloud.com`
- Custom domains are supported and routed via Nginx

### Component System

**Atoms** (basic building blocks):
- Button, Input, Image, Text, Link

**Molecules** (combinations of atoms):
- FormGroup, Card, Hero, TeaserContent

**Organisms** (complex sections):
- Navbar, Footer, ProductGrid, FeaturesSection

Tenants can create **custom components** by combining these core components.

### Content as JSON

Content is stored as JSON, allowing:
- Modular content management
- Easy publishing and versioning
- Flexible component composition
- API-driven content delivery

## Useful Commands

```bash
# Generate new Prisma migration
npm run db:migrate -- --name add_new_field

# Reset database (careful!)
npm run db:reset

# Check API health
curl http://localhost:3004/health

# View logs
docker-compose logs -f

# Clean all builds and node_modules
npm run clean
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `API_URL` - Base URL for API
- `STORAGE_TYPE` - local or s3
- `NODE_ENV` - development, staging, or production

## Troubleshooting

### Port Already in Use

```bash
# Change port for specific service
cd apps/api && npm run dev -- --port 3005
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
psql -U postgres -d postgres -c "SELECT 1"

# Check DATABASE_URL in .env.local
echo $DATABASE_URL
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules && npm install

# Clean Prisma cache
npm run db:generate
```

## Next Steps

1. Review the [README.md](./README.md) for project overview
2. Check [infrastructure/DEPLOYMENT.md](./infrastructure/DEPLOYMENT.md) for deployment guide
3. Explore the [packages/database](./packages/database) for database schema
4. Review [apps/api/src](./apps/api/src) for API structure

## Support

For questions or issues, see the main README or contact support@autodealercloud.com

---

**Happy building!** 🚀
