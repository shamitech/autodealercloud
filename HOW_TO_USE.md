# AutoDealerCloud - How to Use

## Quick Start

### Local Development

```bash
# 1. Install dependencies for all services
npm install
# or on Windows
install.bat

# 2. Start all backend services
npm run dev:backends

# 3. Start all frontend services
npm run dev:frontends

# 4. Or start individual services
cd services/admin-api && npm run dev
cd services/admin-dashboard && npm run dev
```

### Project Structure

```
autodealercloud/
├── services/
│   ├── admin-api/           # Backend: Tenant & user management
│   │   ├── src/
│   │   │   ├── index.ts      # Entry point (port 3010)
│   │   │   ├── database/     # PostgreSQL connection
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── services/     # Business logic
│   │   │   └── middleware/   # Auth, validation
│   │   └── package.json
│   │
│   ├── cms-api/             # Backend: Content management
│   │   ├── src/
│   │   │   ├── index.ts      # Entry point (port 3011)
│   │   │   ├── routes/       # /pages, /components, /publish
│   │   │   └── services/     # Page & component logic
│   │   └── package.json
│   │
│   ├── publisher-api/       # Backend: Public page serving
│   │   ├── src/
│   │   │   ├── index.ts      # Entry point (port 3012)
│   │   │   ├── routes/       # GET /:domain/:page
│   │   │   └── services/     # Page retrieval logic
│   │   └── package.json
│   │
│   ├── admin-dashboard/     # Frontend: Admin panel
│   │   ├── app/
│   │   │   ├── page.tsx      # Dashboard home
│   │   │   ├── login/        # Login page
│   │   │   └── tenants/      # Tenant management
│   │   └── package.json
│   │
│   ├── cms-dashboard/       # Frontend: Content editor
│   │   ├── app/
│   │   │   ├── page.tsx      # Editor home
│   │   │   ├── login/        # Login page
│   │   │   └── pages/        # Page editor
│   │   └── package.json
│   │
│   └── publisher/           # Frontend: Public websites
│       ├── app/
│       │   ├── [tenant]/     # Dynamic tenant routes
│       │   └── [tenant]/[page]/  # Dynamic page routes
│       └── package.json
│
├── shared/
│   └── types/               # Shared TypeScript interfaces
│       ├── index.ts         # All shared types
│       └── package.json
│
├── .env.local              # Environment config (CREATE THIS)
├── .env.example            # Template
├── tsconfig.json           # Root TypeScript config
├── package.json            # Root npm config
└── install.sh              # Linux/Mac installer
```

---

## API Endpoints

### Admin API (Port 3010)

```bash
# Authentication
POST   /auth/register        # Create admin account
POST   /auth/login           # Login with email/password
POST   /auth/refresh         # Refresh JWT token

# Tenant Management
GET    /tenants              # List all tenants
POST   /tenants              # Create new tenant
GET    /tenants/:id          # Get tenant details
PUT    /tenants/:id          # Update tenant
DELETE /tenants/:id          # Delete tenant

# Users
GET    /users/:tenantId      # Get tenant users
POST   /users/:tenantId      # Create user
```

### CMS API (Port 3011)

```bash
# Pages
GET    /pages/:tenantId      # List all pages
POST   /pages/:tenantId      # Create page
GET    /pages/:pageId        # Get page details
PUT    /pages/:pageId        # Update page
DELETE /pages/:pageId        # Delete page

# Components
GET    /components/:tenantId # List components
POST   /components/:tenantId # Create component
PUT    /components/:id       # Update component

# Publishing
POST   /publish/:pageId      # Publish page to live
```

### Publisher API (Port 3012)

```bash
# Public Pages
GET    /:domain              # Get tenant's home page
GET    /:domain/:page        # Get specific page
GET    /:domain/:page/meta   # Get page metadata
```

---

## Common Tasks

### Add a New API Endpoint

**Example: Add user listing to admin-api**

1. Create route handler in `services/admin-api/src/routes/users.ts`:
```typescript
import { Router } from 'express';
import { query } from '../database/connection';

const router = Router();

router.get('/:tenantId', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE tenant_id = $1',
      [req.params.tenantId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
```

2. Import in `services/admin-api/src/index.ts`:
```typescript
import usersRouter from './routes/users';
app.use('/users', usersRouter);
```

3. Restart service:
```bash
cd services/admin-api
npm run dev
```

### Update Shared Types

1. Edit `shared/types/index.ts`:
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
}
```

2. Use in services (already aliased via `@shared/types`):
```typescript
import { User } from '@shared/types';
```

### Deploy Changes to VPS

```bash
# 1. Commit locally
git add .
git commit -m "Add user listing endpoint"

# 2. Push to GitHub
git push origin master

# 3. SSH to VPS and pull
ssh root@185.146.166.77

# 4. Pull latest code
cd /var/www/autodealercloud
git pull origin master

# 5. Restart services (PM2 will auto-install new deps)
pm2 restart all

# Check logs
pm2 logs admin-api
```

---

## Development Workflow

### Local Testing

```bash
# Terminal 1: Start admin-api
cd services/admin-api
npm run dev

# Terminal 2: Start admin-dashboard
cd services/admin-dashboard
npm run dev

# Terminal 3: Start cms-api
cd services/cms-api
npm run dev

# Test endpoints with curl
curl http://localhost:3010/tenants
curl -X POST http://localhost:3011/pages \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "123", "title": "Home"}'
```

### Database Queries

```bash
# Connect to local database
psql -U postgres -d admin_db

# List tables
\dt

# Query data
SELECT * FROM tenants;
SELECT * FROM pages;

# Exit
\q
```

### Build for Production

```bash
# Compile TypeScript for all services
npm run build

# Verify no errors
npm run tsc

# Check specific service
cd services/admin-api
npm run build
```

---

## Environment Configuration

### Create .env.local

Copy from `.env.example` and customize:

```env
NODE_ENV=development

# JWT Secret (change in production!)
JWT_SECRET=your-secret-key-here

# Admin API
ADMIN_PORT=3010
ADMIN_DB_USER=postgres
ADMIN_DB_PASSWORD=postgres
ADMIN_DB_HOST=localhost
ADMIN_DB_NAME=admin_db

# CMS API
CMS_PORT=3011
CMS_DB_USER=postgres
CMS_DB_PASSWORD=postgres
CMS_DB_HOST=localhost
CMS_DB_NAME=cms_db

# Publisher API
PUBLISHER_PORT=3012
PUBLISHER_DB_USER=postgres
PUBLISHER_DB_PASSWORD=postgres
PUBLISHER_DB_HOST=localhost
PUBLISHER_DB_NAME=publisher_db

# Frontend URLs
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3010
NEXT_PUBLIC_CMS_API_URL=http://localhost:3011
NEXT_PUBLIC_PUBLISHER_API_URL=http://localhost:3012
```

---

## PM2 Commands (VPS)

```bash
# SSH to VPS
ssh root@185.146.166.77

# Check all services
pm2 status

# View logs
pm2 logs                          # All services
pm2 logs admin-api                # Specific service
pm2 logs admin-api --lines 50     # Last 50 lines

# Control services
pm2 stop admin-api                # Stop one service
pm2 start admin-api               # Start one service
pm2 restart admin-api             # Restart one service
pm2 restart all                   # Restart all services

# Monitor
pm2 monit                         # Real-time monitoring
pm2 save                          # Save current state
pm2 startup                       # Enable auto-start on reboot
```

---

## Testing

### Test Backend API

```bash
# Check if running
curl http://localhost:3010/health 2>/dev/null || echo "Admin API offline"

# Create tenant
curl -X POST http://localhost:3010/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Dealership",
    "domain": "mydealership.com"
  }'

# Login
curl -X POST http://localhost:3010/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Test Frontend

- Admin Dashboard: http://localhost:3000
- CMS Dashboard: http://localhost:3010
- Publisher: http://localhost:3020

---

## Troubleshooting

### Service won't start
```bash
# Check logs
pm2 logs admin-api

# Rebuild TypeScript
cd services/admin-api
npm run build

# Verify dependencies
npm install
```

### Database connection error
```bash
# Check if PostgreSQL is running
systemctl status postgresql

# Test connection
psql -U postgres -d admin_db -c "SELECT 1;"

# Verify .env.local has correct credentials
cat .env.local | grep DB
```

### Port already in use
```bash
# Find process using port 3010
lsof -i :3010
kill -9 <PID>

# Or restart PM2
pm2 restart admin-api
```

### TypeScript errors
```bash
# Check all services
npm run tsc

# Fix specific service
cd services/admin-api
npx tsc --noEmit
```

---

## File Locations

| Location | Purpose |
|----------|---------|
| `services/*/src/index.ts` | Service entry point |
| `services/*/src/routes/` | API route handlers |
| `services/*/src/services/` | Business logic |
| `services/*/src/database/` | DB connection & queries |
| `services/admin-dashboard/app/` | Admin panel pages |
| `services/cms-dashboard/app/` | Content editor pages |
| `services/publisher/app/` | Public website routes |
| `shared/types/index.ts` | Shared TypeScript types |
| `.env.local` | Environment variables |
| `/var/www/autodealercloud` | VPS production path |

---

## Quick Reference

| Task | Command |
|------|---------|
| Install deps | `npm install` or `install.bat` |
| Start dev | `npm run dev:backends` + `npm run dev:frontends` |
| Build | `npm run build` |
| Type check | `npm run tsc` |
| Deploy | `git push origin master` then SSH to VPS + `git pull` + `pm2 restart all` |
| View logs | `pm2 logs [service-name]` |
| SSH to VPS | `ssh root@185.146.166.77` |
| Databases | admin_db, cms_db, publisher_db (on localhost) |

---

**Status:** ✅ Production running on 185.146.166.77  
**Version:** 1.0.0  
**Last Updated:** January 22, 2026
