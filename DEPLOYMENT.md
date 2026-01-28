# Auto Dealer Cloud - Deployment Guide

## Architecture Overview

**Tech Stack:**
- Frontend: Next.js 14 (App Router) + Tailwind CSS + TypeScript
- Backend: Fastify API (separate service)
- Database: PostgreSQL
- Authentication: Iron Session (HTTPOnly encrypted cookies)
- Containerization: Docker
- Deployment: Docker on VPS (185.146.166.77)

**Services:**
- `admin-frontend`: Next.js on port 3000
- `api`: Fastify on port 3001
- `postgres`: PostgreSQL on port 5432

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- PostgreSQL (if running without Docker)

### Starting Local Environment

```bash
# Navigate to project root
cd c:\xampp\htdocs\autodealercloud

# Start all services with Docker Compose
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f
```

### Access Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

### Login Credentials

- **Username**: `jaredshami`
- **Password**: `Children$6`

### Testing Flow

1. Navigate to http://localhost:3000 → redirects to /login
2. Enter credentials and login
3. Redirected to /dashboard/add-tenant
4. Create a tenant with name, slug, and optional domain
5. View created tenants in the table below
6. Click "Logout" button to exit

---

## Deployment to VPS (185.146.166.77)

### Prerequisites on VPS

1. Install Docker and Docker Compose
2. PostgreSQL database already exists on VPS
3. Port 80 and 443 available for Nginx reverse proxy

### Deployment Steps

#### 1. SSH into VPS

```bash
ssh root@185.146.166.77
```

#### 2. Clone/Transfer Project

```bash
# Option A: Clone from repository (if using Git)
git clone <repo-url> /home/autodealercloud
cd /home/autodealercloud

# Option B: Transfer files manually
scp -r . root@185.146.166.77:/home/autodealercloud
```

#### 3. Update Environment Files

**Create `/home/autodealercloud/api/.env`:**
```
DATABASE_URL=postgresql://admin:password@vps-postgres-host:5432/autodealercloud
NODE_ENV=production
```

**Create `/home/autodealercloud/admin-frontend/.env.local`:**
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
SESSION_SECRET=generate-a-random-32-char-secret
```

#### 4. Build Docker Images on VPS

```bash
cd /home/autodealercloud
docker compose build
```

#### 5. Start Services

```bash
docker compose up -d
```

#### 6. Verify Services

```bash
docker compose ps
docker compose logs api
docker compose logs admin-frontend
```

#### 7. Setup Nginx Reverse Proxy

Create `/etc/nginx/sites-available/autodealercloud`:

```nginx
upstream api {
    server localhost:3001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com api.your-domain.com;
    
    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API
    location /api {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/autodealercloud /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### 8. Setup SSL (Let's Encrypt)

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d api.your-domain.com
```

---

## Database Migrations

### Create Prisma Migration

```bash
cd packages/database
npx prisma migrate dev --name initial_schema
```

### Apply to Production

```bash
cd packages/database
npx prisma migrate deploy
```

---

## Monitoring and Maintenance

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f admin-frontend
```

### Restart Services

```bash
docker compose restart api
docker compose restart admin-frontend
```

### Update Code

```bash
git pull origin main
docker compose down
docker compose build
docker compose up -d
```

### Database Backup

```bash
docker compose exec postgres pg_dump -U admin autodealercloud > backup.sql
```

---

## Troubleshooting

### Services Not Starting

1. Check Docker is running: `docker ps`
2. View logs: `docker compose logs`
3. Check port availability: `netstat -an | grep 3000`

### Database Connection Error

1. Verify DATABASE_URL in `.env`
2. Check PostgreSQL is running: `docker compose ps postgres`
3. Test connection: `psql postgresql://admin:postgres@localhost:5432/autodealercloud`

### Session Not Persisting

1. Verify SESSION_SECRET is set in frontend `.env.local`
2. Clear browser cookies
3. Check Iron Session is installed: `npm list iron-session`

### Login Always Fails

1. Verify credentials: `jaredshami` / `Children$6`
2. Check API is running on port 3001
3. View API logs: `docker compose logs api`
4. Test API directly: `curl -X POST http://localhost:3001/login -H "Content-Type: application/json" -d '{"username":"jaredshami","password":"Children$6"}'`

---

## File Structure

```
autodealercloud/
├── admin-frontend/          # Next.js frontend
│   ├── app/
│   │   ├── api/auth/       # Session routes
│   │   ├── dashboard/      # Protected pages
│   │   ├── login/          # Login page
│   │   └── page.tsx        # Root (redirects to login)
│   ├── lib/session.ts      # Iron Session config
│   ├── middleware.ts       # Route protection
│   ├── .env.local          # Frontend config
│   └── package.json
├── api/                     # Fastify backend
│   ├── src/
│   │   ├── index.ts        # Server entry
│   │   └── routes/
│   │       ├── auth.ts     # Login/logout
│   │       └── tenants.ts  # Create/list tenants
│   ├── Dockerfile
│   ├── .env                # Backend config
│   ├── tsconfig.json
│   └── package.json
├── packages/database/       # Shared Prisma
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── .env
│   └── package.json
├── docker-compose.yml       # Local dev orchestration
└── package.json             # Root workspace
```

---

## Security Notes

⚠️ **Current Implementation:**
- Hardcoded admin credentials in API (for MVP)
- Session secret in environment variables
- HTTPOnly cookies prevent XSS attacks
- Automatic CSRF protection via Next.js

**For Production:**
- Replace hardcoded credentials with database-stored hashed passwords
- Use strong SESSION_SECRET (generate: `openssl rand -base64 32`)
- Enable HTTPS-only cookies
- Implement rate limiting on login endpoint
- Add CORS policy enforcement
- Regular security audits

---

## API Endpoints

### Authentication

**POST /login**
```json
{
  "username": "jaredshami",
  "password": "Children$6"
}
```
Response: `{ success: true, message: "Authenticated", user: { id, username } }`

**POST /logout**
Response: `{ success: true, message: "Logged out" }`

### Tenants

**POST /tenants**
```json
{
  "name": "John's Auto Dealership",
  "slug": "johns-auto",
  "domain": "johns-auto.com"  // optional
}
```
Response: `{ success: true, message: "Tenant created", tenant: { id, name, slug, domain, createdAt, updatedAt } }`

**GET /tenants**
Response: `{ success: true, tenants: [...] }`

---

## Support & Debugging

For issues or questions, check:
1. Docker logs: `docker compose logs`
2. Frontend console (Browser DevTools)
3. Network tab for API failures
4. Database connection string in `.env` files
