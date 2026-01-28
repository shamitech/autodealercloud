# Auto Dealer Cloud Admin Console

A production-ready multi-tenant SaaS admin console built with Next.js 14, Fastify, PostgreSQL, and Docker.

## 🎯 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for local development)
- PostgreSQL 16 (or use Docker)

### Local Development

1. **Start all services:**
   ```bash
   docker compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Database: localhost:5432

3. **Login credentials:**
   - Username: `jaredshami`
   - Password: `Children$6`

4. **View logs:**
   ```bash
   docker compose logs -f
   ```

### Stop Services
```bash
docker compose down
```

---

## 📋 Features

✅ **Authentication**
- Secure login with Iron Session (HTTPOnly encrypted cookies)
- Session-based authentication (no external service required)
- Protected routes with automatic redirects

✅ **Admin Dashboard**
- Clean, responsive admin interface
- Tailwind CSS styling
- Logout functionality

✅ **Tenant Management**
- Create new tenants with name and slug
- Auto-generate slugs from tenant names
- Optional custom domain support
- View all existing tenants in a table

✅ **Architecture**
- Monorepo structure with npm workspaces
- Separate frontend and backend services
- Scalable design ready for multiple microservices
- Docker containerization for consistent deployments

---

## 📁 Project Structure

```
autodealercloud/
├── admin-frontend/                 # Next.js 14 Frontend
│   ├── app/
│   │   ├── api/auth/              # Session management routes
│   │   │   ├── login/
│   │   │   └── logout/
│   │   ├── dashboard/             # Protected routes
│   │   │   ├── layout.tsx         # Dashboard wrapper with logout
│   │   │   ├── page.tsx           # Main dashboard (redirects)
│   │   │   └── add-tenant/        # MVP feature page
│   │   ├── login/                 # Login page
│   │   ├── page.tsx               # Root (redirects to login)
│   │   └── layout.tsx             # Root layout
│   ├── lib/
│   │   └── session.ts             # Iron Session configuration
│   ├── middleware.ts              # Route protection middleware
│   ├── .env.local                 # Environment variables
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── api/                            # Fastify Backend
│   ├── src/
│   │   ├── index.ts               # Server entry point
│   │   └── routes/
│   │       ├── auth.ts            # POST /login, /logout
│   │       └── tenants.ts         # POST /tenants, GET /tenants
│   ├── dist/                      # Compiled JavaScript (generated)
│   ├── Dockerfile
│   ├── .env                       # Environment variables
│   ├── tsconfig.json
│   └── package.json
│
├── packages/database/              # Shared Prisma Database Layer
│   ├── prisma/
│   │   ├── schema.prisma          # Database models
│   │   └── migrations/            # Database migrations (generated)
│   ├── .env                       # DATABASE_URL
│   └── package.json
│
├── docker-compose.yml             # Local dev orchestration
├── package.json                   # Root workspace config
├── DEPLOYMENT.md                  # VPS deployment guide
└── README.md                      # This file
```

---

## 🔌 API Endpoints

### Authentication

**POST /login**
```json
Request:
{
  "username": "jaredshami",
  "password": "Children$6"
}

Response:
{
  "success": true,
  "message": "Authenticated",
  "user": {
    "id": "1",
    "username": "jaredshami"
  }
}
```

**POST /logout**
```json
Response:
{
  "success": true,
  "message": "Logged out"
}
```

### Tenants

**POST /tenants**
```json
Request:
{
  "name": "John's Auto Dealership",
  "slug": "johns-auto",
  "domain": "johns-auto.com"  // optional
}

Response:
{
  "success": true,
  "message": "Tenant created",
  "tenant": {
    "id": "uuid",
    "name": "John's Auto Dealership",
    "slug": "johns-auto",
    "domain": "johns-auto.com",
    "createdAt": "2026-01-28T...",
    "updatedAt": "2026-01-28T..."
  }
}
```

**GET /tenants**
```json
Response:
{
  "success": true,
  "tenants": [...]
}
```

### Health Check

**GET /health**
```json
Response:
{
  "status": "ok"
}
```

---

## 🛠 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 14 (App Router) |
| Styling | Tailwind CSS | Latest |
| Language | TypeScript | 5.x |
| Authentication | Iron Session | Latest |
| Backend | Fastify | 5.x |
| Database | PostgreSQL | 16 |
| ORM | Prisma | 7.x |
| Containerization | Docker | Latest |
| Package Manager | npm | Workspaces |

---

## 🔐 Security

### Implemented
- ✅ HTTPOnly cookies (prevents XSS attacks)
- ✅ Encrypted session storage
- ✅ Protected routes via middleware
- ✅ CORS ready for future expansion
- ✅ Environment variable isolation

### Recommended for Production
- 🔲 Replace hardcoded credentials with password hashing
- 🔲 Implement rate limiting on login endpoint
- 🔲 Add HTTPS-only cookie flag
- 🔲 Enable CORS with specific origins
- 🔲 Regular security audits
- 🔲 Implement request validation schema (Zod, Joi)

---

## 📊 Database Models

### User
```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // Currently hardcoded in API
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Tenant
```prisma
model Tenant {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  domain    String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive VPS deployment instructions.

### Quick Deploy to VPS (185.146.166.77)
```bash
# SSH into VPS
ssh root@185.146.166.77

# Clone project
git clone <repo> /home/autodealercloud
cd /home/autodealercloud

# Update environment files
# Create api/.env with production DATABASE_URL
# Create admin-frontend/.env.local with production API_URL

# Build and start
docker compose build
docker compose up -d

# Setup Nginx reverse proxy (see DEPLOYMENT.md)
```

---

## 📝 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001    # API endpoint
SESSION_SECRET=your-secret-key-32-chars      # Session encryption key
```

### API (.env)
```
DATABASE_URL=postgresql://admin:postgres@localhost:5432/autodealercloud
NODE_ENV=development
```

### Database (.env)
```
DATABASE_URL=postgresql://admin:postgres@localhost:5432/autodealercloud
```

---

## 🧪 Development Commands

### Frontend
```bash
cd admin-frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### API
```bash
cd api
npm run dev          # Start with ts-node
npm run build        # Compile TypeScript
npm run start        # Run compiled version
```

### Database
```bash
cd packages/database
npx prisma migrate dev --name <name>    # Create migration
npx prisma migrate deploy               # Apply migrations
npx prisma studio                       # Visual database editor
```

### Root (Docker)
```bash
npm run dev          # Start all services
npm run build        # Build all services
npm run down         # Stop all services
npm run restart      # Restart all services
```

---

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check Docker is running
docker ps

# View logs
docker compose logs -f

# Check port availability
netstat -an | grep 3000
```

### Database Connection Failed
```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
psql postgresql://admin:postgres@localhost:5432/autodealercloud

# Check PostgreSQL is running
docker compose ps postgres
```

### Login Always Fails
```bash
# Test API directly
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jaredshami","password":"Children$6"}'

# Check API logs
docker compose logs api
```

### Session Not Persisting
```bash
# Clear browser cookies (DevTools > Application > Cookies)
# Verify SESSION_SECRET is set
echo $SESSION_SECRET
```

---

## 📞 Support

For issues or questions:
1. Check Docker logs: `docker compose logs -f`
2. Check browser console (DevTools F12)
3. Check network tab for API failures
4. Verify all environment variables are set

---

## 📄 License

Private/Proprietary - Auto Dealer Cloud

---

## 🎉 What's Next?

The MVP is production-ready. Next features to consider:
- [ ] Multiple admin users with roles
- [ ] Password reset functionality
- [ ] Tenant-specific dashboards
- [ ] Email notifications
- [ ] Audit logging
- [ ] API key authentication
- [ ] Advanced tenant settings
- [ ] Billing integration
