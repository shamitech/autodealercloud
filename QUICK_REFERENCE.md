# 🚀 QUICK REFERENCE

## Local Development

```bash
# Start all services
cd c:\xampp\htdocs\autodealercloud
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Build for production
npm run build
```

## Access Points (Local)
- **Frontend**: http://localhost:3000 → redirects to /login
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Database**: localhost:5432 (admin/postgres)

## Login Credentials
```
Username: jaredshami
Password: Children$6
```

## User Flow
```
1. Visit http://localhost:3000
   ↓
2. Redirects to /login (not authenticated)
   ↓
3. Enter credentials → Submit
   ↓
4. POST /api/auth/login → Sets session cookie
   ↓
5. Redirects to /dashboard/add-tenant
   ↓
6. Can now create/view tenants
   ↓
7. Click Logout → Destroys session
   ↓
8. Redirected to /login
```

## Key Files

### Frontend (admin-frontend/)
| File | Purpose |
|------|---------|
| app/page.tsx | Root redirect to /login |
| app/login/page.tsx | Login form |
| app/dashboard/layout.tsx | Protected wrapper + logout |
| app/dashboard/add-tenant/page.tsx | Create/view tenants |
| middleware.ts | Route protection |
| lib/session.ts | Session config |
| api/auth/login/route.ts | Login handler |
| api/auth/logout/route.ts | Logout handler |

### Backend (api/)
| File | Purpose |
|------|---------|
| src/index.ts | Server setup |
| src/routes/auth.ts | /login, /logout endpoints |
| src/routes/tenants.ts | /tenants endpoints |
| .env | DATABASE_URL, NODE_ENV |

### Database (packages/database/)
| File | Purpose |
|------|---------|
| prisma/schema.prisma | User & Tenant models |

## API Endpoints

```
POST /login
  Body: { username: "jaredshami", password: "Children$6" }
  Response: { success: true, user: {...} }

POST /logout
  Response: { success: true }

POST /tenants
  Body: { name: "...", slug: "...", domain?: "..." }
  Response: { success: true, tenant: {...} }

GET /tenants
  Response: { success: true, tenants: [...] }

GET /health
  Response: { status: "ok" }
```

## Build Commands

```bash
# Frontend
cd admin-frontend
npm run dev          # Development
npm run build        # Production build
npm run lint         # Check errors

# Backend
cd ../api
npm run dev          # Development (ts-node)
npm run build        # Compile TypeScript
npm run start        # Run compiled version

# Database
cd ../packages/database
npx prisma migrate dev --name <name>   # Create migration
npx prisma studio                      # Visual DB editor
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
SESSION_SECRET=this-is-a-very-long-secret-key-minimum-32-characters-required!
```

### Backend (.env)
```
DATABASE_URL=postgresql://admin:postgres@localhost:5432/autodealercloud
NODE_ENV=development
```

### Database (.env)
```
DATABASE_URL=postgresql://admin:postgres@localhost:5432/autodealercloud
```

## Docker Commands

```bash
# See all services
docker compose ps

# View service logs
docker compose logs api
docker compose logs admin-frontend
docker compose logs postgres

# Stop all
docker compose down

# Remove volumes (reset DB)
docker compose down -v

# Rebuild images
docker compose build

# Fresh start
docker compose down && docker compose up -d
```

## Deployment (VPS 185.146.166.77)

```bash
# SSH into VPS
ssh root@185.146.166.77

# Clone project
git clone <repo> /home/autodealercloud
cd /home/autodealercloud

# Update .env files with production values
# Edit api/.env and admin-frontend/.env.local

# Build and start
docker compose build
docker compose up -d

# Setup Nginx reverse proxy (see DEPLOYMENT.md)
# Setup SSL with Let's Encrypt (see DEPLOYMENT.md)
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `docker: command not found` | Install Docker Desktop |
| `EADDRINUSE :::3000` | Port 3000 in use. Kill process or change port |
| `Cannot connect to database` | Check DATABASE_URL in .env |
| `Login fails` | Check credentials: jaredshami / Children$6 |
| `Session not working` | Clear browser cookies, restart server |
| `Build fails` | Run `npm install` in the failing service |

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Tenant {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  domain    String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Technology Versions

- Node.js: 20+ (Alpine)
- Next.js: 14.1
- Fastify: 5.7.2
- Prisma: 7.3
- PostgreSQL: 16 (Alpine)
- TypeScript: 5.9
- Tailwind CSS: 4.x

## Project Structure

```
autodealercloud/
├── admin-frontend/     (Next.js frontend)
├── api/                (Fastify backend)
├── packages/
│   └── database/      (Prisma schema)
├── docker-compose.yml
├── package.json       (monorepo)
├── README.md
├── DEPLOYMENT.md
├── MASTER_PLAN.md
└── PROJECT_COMPLETE.md
```

## Important Notes

- ⚠️ Hardcoded credentials are MVP only (replace with bcrypt for production)
- ⚠️ SESSION_SECRET should be changed for production
- ✅ HTTPOnly cookies prevent XSS attacks
- ✅ Middleware protects /dashboard/* routes
- ✅ Docker Compose handles service dependencies
- ✅ All code is TypeScript (type-safe)

---

**Status**: 🎉 Ready for Deployment  
**Last Updated**: January 28, 2026  
**For Details**: See README.md, DEPLOYMENT.md, MASTER_PLAN.md
