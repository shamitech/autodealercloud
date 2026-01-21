# AutoDealerCloud

Cloud-based CMS specifically for Auto Dealerships

## Architecture

This is a monorepo containing 4 separate services:

- **core-cms** - Main CMS engine (shared across all tenants)
- **account-portal** - Tenant self-service portal
- **admin-portal** - Admin dashboard for managing all tenants
- **domain-router** - Middleware for routing custom domains

## Project Structure

```
autodealercloud/
├── services/
│   ├── core-cms/
│   ├── account-portal/
│   ├── admin-portal/
│   └── domain-router/
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables in each service
3. Run development mode: `npm run dev`
4. Build: `npm run build`

## Database

Each tenant has a separate PostgreSQL database.

## Multi-Tenancy Structure

- **Company ID**: c10000
- **Environment ID**: e10234
- **Domains**:
  - Auth (Authoring): `c10000-e10234-auth.autodealercloud.com`
  - Stage (Preview): `c10000-e10234-stage.autodealercloud.com`
  - Pub (Published): `c10000-e10234-pub.autodealercloud.com`
  - Custom Domain: `www.mydealership.com` (points to pub)
