# VPS Deployment - Quick Start

## 🚀 One-Command Full Deployment

From your local machine in the project root:

```bash
bash infrastructure/upload-to-vps.sh
```

This script will:
1. ✅ Create `/var/www/autodealercloud` on VPS
2. ✅ Upload all project files via SCP
3. ✅ Install Node.js and PM2
4. ✅ Run `npm install` and `npm run db:generate`
5. ✅ Create `.env.production` template
6. ✅ Start all 4 services with PM2
7. ✅ Configure auto-restart on VPS reboot
8. ✅ Verify Nginx configuration

## 📋 Prerequisites

- ✅ VPS access: `ssh root@185.146.166.77` (passwordless SSH recommended)
- ✅ Nginx configured with all 4 configs (already done ✓)
- ✅ `scp` and `ssh` available on your local machine

## ⚙️ Configuration After Deployment

### 1. Update Environment Variables
```bash
ssh root@185.146.166.77
nano /var/www/autodealercloud/.env.production
```

Update these values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/autodealercloud"
JWT_SECRET="<random-secure-string>"
```

### 2. Setup Database (Optional)
If PostgreSQL is installed on VPS:

```bash
ssh root@185.146.166.77
cd /var/www/autodealercloud

# Create database and user
sudo -u postgres psql << EOF
CREATE USER autodealercloud WITH PASSWORD 'your_secure_password';
CREATE DATABASE autodealercloud OWNER autodealercloud;
GRANT ALL PRIVILEGES ON DATABASE autodealercloud TO autodealercloud;
EOF

# Update .env.production with database URL
nano .env.production

# Run migrations
npm run db:migrate

# Seed initial data (admin user, components)
npm run db:seed
```

## 📊 Verify Deployment

### Check all services running:
```bash
ssh root@185.146.166.77 "pm2 list"
```

Expected output:
```
│ id │ name            │ mode │ status   │ ↺ │ cpu │ memory   │
├────┼─────────────────┼──────┼──────────┼───┼─────┼──────────┤
│ 0  │ marketing-site  │ fork │ online   │ 0 │ 0%  │ 45.2 MB  │
│ 1  │ admin-panel     │ fork │ online   │ 0 │ 0%  │ 48.1 MB  │
│ 2  │ tenant-cms      │ fork │ online   │ 0 │ 0%  │ 42.8 MB  │
│ 3  │ api             │ fork │ online   │ 0 │ 1%  │ 38.5 MB  │
│ 4  │ api             │ fork │ online   │ 0 │ 0%  │ 37.2 MB  │
```

### Check API health:
```bash
curl https://api.autodealercloud.com/health
```

Should return:
```json
{"status":"ok"}
```

### View service logs:
```bash
ssh root@185.146.166.77 "pm2 logs api --lines 50"
```

## 🌍 Access Your Application

After successful deployment:

- **Marketing Site:** https://autodealercloud.com
- **Admin Panel:** https://admin.autodealercloud.com
- **API:** https://api.autodealercloud.com
- **Tenant CMS:** https://{tenant-slug}-auth.autodealercloud.com

All with automatic HTTPS/SSL via Let's Encrypt! 🔒

## 📝 Common Commands

### View all logs
```bash
ssh root@185.146.166.77 "pm2 logs"
```

### Restart a service
```bash
ssh root@185.146.166.77 "pm2 restart api"
```

### Stop all services
```bash
ssh root@185.146.166.77 "pm2 stop all"
```

### Start all services
```bash
ssh root@185.146.166.77 "pm2 start ecosystem.config.json"
```

### View resource usage
```bash
ssh root@185.146.166.77 "top -b -n 1"
```

## 🔧 Troubleshooting

### Services fail to start
1. Check logs: `pm2 logs`
2. Verify Node.js: `node -v` (should be v24+)
3. Check ports: `lsof -i :3000` (should be free)

### API not responding
1. Check if running: `pm2 list`
2. View error logs: `pm2 logs api --err`
3. Test locally: `curl http://localhost:3004/health`

### Database connection error
1. Verify DATABASE_URL in `.env.production`
2. Test connection: `psql $DATABASE_URL`
3. Check PostgreSQL running: `systemctl status postgresql`

### Nginx not routing traffic
1. Test config: `nginx -t`
2. Reload Nginx: `systemctl reload nginx`
3. Check logs: `tail -f /var/log/nginx/error.log`

## 📚 Additional Resources

- Full deployment guide: [infrastructure/VPS_DEPLOYMENT.md](infrastructure/VPS_DEPLOYMENT.md)
- PM2 config: [ecosystem.config.json](ecosystem.config.json)
- Nginx configs: `/etc/nginx/conf.d/`
- Database schema: [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma)

## 🎯 Next Steps

1. **Run upload script:** `bash infrastructure/upload-to-vps.sh`
2. **Configure environment:** Update `.env.production` on VPS
3. **Setup database:** Run migrations and seed (if using PostgreSQL)
4. **Verify deployment:** Check all services running and accessible
5. **Monitor logs:** Watch `pm2 logs` for any errors
6. **Custom domains:** Add custom domain configs as tenants are created

---

**Status:** ✅ Ready for deployment
**Services:** 4 (Marketing, Admin, CMS, API)
**Nginx:** ✅ Configured
**SSL:** ✅ Let's Encrypt setup included
**PM2:** ✅ Auto-restart enabled

🚀 You're all set! Run the deployment script to go live.
