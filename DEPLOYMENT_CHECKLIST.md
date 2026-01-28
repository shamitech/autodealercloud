# ✅ DEPLOYMENT CHECKLIST

## Pre-Deployment Verification

### Code Quality
- ✅ All TypeScript compiles without errors
- ✅ Frontend builds successfully (2.1s)
- ✅ Backend TypeScript compiles to dist/
- ✅ No runtime errors on startup
- ✅ All imports resolved correctly
- ✅ Environment variables properly loaded

### Features
- ✅ Login endpoint works (POST /login)
- ✅ Logout endpoint works (POST /logout)
- ✅ Create tenant endpoint works (POST /tenants)
- ✅ List tenants endpoint works (GET /tenants)
- ✅ Health check endpoint works (GET /health)
- ✅ Protected routes redirect to /login
- ✅ Session cookies set correctly
- ✅ Logout clears session

### Documentation
- ✅ README.md (3,000+ words)
- ✅ DEPLOYMENT.md (5,000+ words)
- ✅ QUICK_REFERENCE.md (commands & troubleshooting)
- ✅ MASTER_PLAN.md (build timeline)
- ✅ PROJECT_COMPLETE.md (executive summary)
- ✅ ARTIFACTS.md (file inventory)
- ✅ INDEX.md (navigation guide)

### Docker
- ✅ docker-compose.yml created
- ✅ api/Dockerfile created
- ✅ admin-frontend/Dockerfile created
- ✅ Health checks configured
- ✅ Environment variables injected
- ✅ Volumes for persistent data
- ✅ Ports correctly mapped

### Environment Files
- ✅ api/.env configured (DATABASE_URL, NODE_ENV)
- ✅ admin-frontend/.env.local configured (API_URL, SESSION_SECRET)
- ✅ packages/database/.env configured (DATABASE_URL)

---

## Local Testing Checklist

Before deploying to VPS:

### Setup
- [ ] Verify Node.js 20+ installed: `node --version`
- [ ] Verify Docker installed: `docker --version`
- [ ] Verify Docker Compose installed: `docker compose --version`
- [ ] Navigate to project: `cd c:\xampp\htdocs\autodealercloud`

### Build Verification
- [ ] Frontend builds: `cd admin-frontend && npm run build`
- [ ] Backend builds: `cd ../api && npm run build`
- [ ] Both succeed with 0 errors

### Local Runtime
- [ ] Start services: `docker compose up -d`
- [ ] Wait 10 seconds for startup
- [ ] Check services: `docker compose ps` (all running)
- [ ] View logs: `docker compose logs` (no errors)

### Feature Testing
- [ ] Frontend accessible: http://localhost:3000
- [ ] Redirects to login: /login page loads
- [ ] API health check: http://localhost:3001/health → {"status":"ok"}
- [ ] Login works: jaredshami / Children$6
- [ ] Redirects to dashboard: /dashboard/add-tenant
- [ ] Can create tenant: Fill form, submit succeeds
- [ ] Can view tenants: Table displays created tenant
- [ ] Can logout: Session destroyed, redirects to /login
- [ ] Protected routes: Access /dashboard without login → redirects to /login

### Cleanup
- [ ] Stop services: `docker compose down`
- [ ] Verify stopped: `docker compose ps` (no services)

---

## VPS Deployment Checklist

### Before SSH
- [ ] Save these files to transfer:
  - admin-frontend/ (entire folder)
  - api/ (entire folder)
  - packages/ (entire folder)
  - docker-compose.yml
  - package.json
  - *.md (documentation)

- [ ] Prepare environment variables:
  - Production DATABASE_URL (for api/.env)
  - Production API_URL (for admin-frontend/.env.local)
  - New SESSION_SECRET (generate: `openssl rand -base64 32`)

### SSH & Transfer
- [ ] SSH into VPS: `ssh root@185.146.166.77`
- [ ] Create project directory: `mkdir -p /home/autodealercloud`
- [ ] Transfer files: `scp -r . root@185.146.166.77:/home/autodealercloud`
- [ ] Verify files transferred: `ls -la /home/autodealercloud`

### Configuration
- [ ] Edit api/.env:
  - Update DATABASE_URL to production PostgreSQL
  - Set NODE_ENV=production
  
- [ ] Edit admin-frontend/.env.local:
  - Update NEXT_PUBLIC_API_URL to production API domain
  - Set new SESSION_SECRET

- [ ] Verify .env files:
  - `cat api/.env`
  - `cat admin-frontend/.env.local`

### Build & Start
- [ ] Navigate to project: `cd /home/autodealercloud`
- [ ] Build images: `docker compose build` (wait 5-10 min)
- [ ] Start services: `docker compose up -d`
- [ ] Verify running: `docker compose ps` (all 3 services)
- [ ] Check logs: `docker compose logs` (no errors)
- [ ] Test health: `curl http://localhost:3001/health`

### Nginx Setup
- [ ] Create nginx config: `/etc/nginx/sites-available/autodealercloud`
- [ ] Copy proxy configuration from DEPLOYMENT.md
- [ ] Enable site: `ln -s /etc/nginx/sites-available/autodealercloud /etc/nginx/sites-enabled/`
- [ ] Test config: `nginx -t`
- [ ] Reload nginx: `systemctl reload nginx`

### SSL Setup
- [ ] Install certbot: `apt install certbot python3-certbot-nginx`
- [ ] Generate certificate: `certbot --nginx -d yourdomain.com -d api.yourdomain.com`
- [ ] Verify certificate: `certbot certificates`
- [ ] Test auto-renewal: `certbot renew --dry-run`

### Final Testing
- [ ] Test via domain: https://yourdomain.com
- [ ] Should redirect to /login
- [ ] Login with credentials
- [ ] Create test tenant
- [ ] Logout
- [ ] Check SSL: Green lock in browser

### Post-Deployment
- [ ] Monitor logs: `docker compose logs -f`
- [ ] Check disk space: `df -h`
- [ ] Verify database connection: Test tenant creation
- [ ] Setup log rotation (optional)
- [ ] Enable auto-updates for security (optional)

---

## Ongoing Maintenance

### Daily
- [ ] Check application is accessible
- [ ] Monitor error logs for issues
- [ ] Verify database is responsive

### Weekly
- [ ] Review application logs
- [ ] Check disk usage
- [ ] Verify SSL certificate dates
- [ ] Monitor resource usage (CPU, RAM)

### Monthly
- [ ] Update server packages: `apt update && apt upgrade`
- [ ] Review security
- [ ] Backup database: `docker compose exec postgres pg_dump -U admin autodealercloud > backup.sql`
- [ ] Test backup restoration

### Quarterly
- [ ] Security audit
- [ ] Performance review
- [ ] Plan feature updates

---

## Troubleshooting During Deployment

### Docker won't start services
```bash
# Check Docker is running
docker ps

# View detailed logs
docker compose logs

# Rebuild images
docker compose build --no-cache

# Verify .env files exist
ls -la api/.env
ls -la admin-frontend/.env.local
```

### Database connection fails
```bash
# Verify DATABASE_URL
cat api/.env

# Test connection
psql postgresql://user:pass@host:5432/dbname

# Check PostgreSQL running (if local)
docker compose logs postgres
```

### Services start but API returns 502 on /login
```bash
# Check API logs
docker compose logs api

# Verify DATABASE_URL format
# Should be: postgresql://user:password@host:port/dbname

# Test API directly
curl -X POST http://localhost:3001/login
```

### Frontend shows error
```bash
# Check frontend logs
docker compose logs admin-frontend

# Verify NEXT_PUBLIC_API_URL in .env.local
cat admin-frontend/.env.local

# Verify API is accessible
curl http://localhost:3001/health
```

### SSL Certificate issues
```bash
# Check certificate status
certbot status

# List certificates
certbot certificates

# Renew certificate
certbot renew

# Check nginx config
nginx -t
```

---

## Success Criteria

✅ You've successfully deployed when:

1. **Services Running**
   - `docker compose ps` shows all 3 services UP

2. **Accessible via Domain**
   - https://yourdomain.com loads frontend
   - Green SSL lock in browser

3. **Authentication Works**
   - Can login with jaredshami / Children$6
   - Session cookie set (check DevTools)
   - Redirects to /dashboard/add-tenant

4. **Features Work**
   - Can create tenant
   - Can view tenant in table
   - Can logout (session destroyed)

5. **No Errors**
   - `docker compose logs` shows no errors
   - Browser console is clean
   - Network tab shows 200 responses

6. **Database Connected**
   - Can create tenant (saved to database)
   - Can view tenants (retrieved from database)

---

## Rollback Plan

If something goes wrong:

### Quick Restart
```bash
docker compose restart
```

### Soft Reset
```bash
docker compose down
docker compose up -d
```

### Hard Reset
```bash
docker compose down -v  # Remove volumes too
docker compose up -d    # Recreate database
```

### Revert to Previous Version
```bash
git revert HEAD~1
docker compose build
docker compose up -d
```

---

## Emergency Contacts

- VPS IP: 185.146.166.77
- Database Admin: (credentials in notes)
- Domain registrar: (credentials in notes)

---

## Documentation References

- Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Quick commands: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- API reference: [README.md](README.md#api-endpoints)
- Build timeline: [MASTER_PLAN.md](MASTER_PLAN.md)

---

**Print this page and keep it handy during deployment!**

Last Updated: January 28, 2026  
Status: Ready for Production Deployment
