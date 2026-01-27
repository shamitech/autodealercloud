# Multi-Tenant CMS Authoring Application

This is the content management system (CMS) where tenants log in to create, edit, and publish pages for their websites.

## Architecture

- **Framework**: Next.js 14 (React)
- **Port**: 3002
- **Subdomain Pattern**: `{tenantSlug}-auth.autodealershipcloud.com`
- **Authentication**: JWT tokens via API
- **Multi-tenancy**: Tenant detection from subdomain + tenant ID filtering

## Directory Structure

```
apps/cms/
├── app/
│   ├── layout.tsx          # Main app layout with sidebar
│   ├── page.tsx            # Dashboard/home
│   ├── login/
│   │   └── page.tsx        # Login page
│   ├── pages/
│   │   └── page.tsx        # Pages management UI
│   ├── templates/
│   │   └── page.tsx        # Templates management (placeholder)
│   ├── components/
│   │   └── page.tsx        # Components management (placeholder)
│   ├── users/
│   │   └── page.tsx        # Team user management (placeholder)
│   ├── assets/
│   │   └── page.tsx        # Media/asset management (placeholder)
│   ├── settings/
│   │   └── page.tsx        # Tenant settings
│   └── globals.css         # Global styles
├── lib/
│   ├── api.ts              # Axios API client
│   ├── store.ts            # Zustand auth store
│   └── tenant.ts           # Tenant utilities
├── middleware.ts           # Subdomain detection middleware
├── .env.local              # Environment variables
└── NGINX_CONFIG_EXAMPLE.conf  # Nginx setup guide
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd apps/cms
npm install
```

### 2. Environment Configuration

Update `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.autodealercloud.com/api/v1
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Development

```bash
npm run dev
# App runs on http://localhost:3002
```

### 4. Production Build

```bash
npm run build
npm start
```

## How It Works

### Authentication Flow

1. User visits `{tenantSlug}-auth.autodealershipcloud.com`
2. Middleware extracts tenant slug from subdomain
3. User logs in with email/password
4. API endpoint `/auth/cms-login` validates credentials and returns:
   - JWT token
   - User info
   - Tenant info
5. Token stored in localStorage
6. Subsequent requests include token in Authorization header

### Tenant Isolation

- **Subdomain → Tenant Mapping**: `myautodealer-auth.autodealershipcloud.com` → extracts `myautodealer`
- **Tenant ID Lookup**: From database using tenant slug
- **Data Filtering**: All API queries include `?tenantId=xyz` filter
- **Frontend Store**: Zustand store maintains current user + tenant context

### Page Management

User navigates to `/pages` section:
- Lists all pages for their tenant (fetched from API)
- Shows page title, slug, status (draft/published), creation date
- Can edit, delete, publish pages
- Button to create new page

## Key Features

### Current (MVP)

- ✅ Multi-tenant subdomain routing
- ✅ JWT authentication
- ✅ Login page
- ✅ Dashboard with navigation
- ✅ Pages listing
- ✅ Tenant context in sidebar
- ✅ Logout functionality

### Next Phase (Required)

- 🔄 Page editor (create/edit/delete pages)
- 🔄 Publish workflow (save as draft, publish to custom domain)
- 🔄 Page preview before publish
- 🔄 Template management
- 🔄 Component builder/extensions
- 🔄 User management (invite team members)
- 🔄 Asset management (upload images/files)
- 🔄 Custom domain configuration

## API Integration

The CMS communicates with the main API (port 3004):

### Authentication
```
POST /api/v1/auth/cms-login
Body: { email, password, tenantSlug }
Response: { token, user, tenant }
```

### Pages
```
GET /api/v1/tenants/:tenantId/pages
Response: { data: [pages...] }

POST /api/v1/tenants/:tenantId/pages
Body: { title, slug, content, status }
Response: { data: page }

PATCH /api/v1/tenants/:tenantId/pages/:pageId
Body: { title, slug, content, status }
Response: { data: page }

DELETE /api/v1/tenants/:tenantId/pages/:pageId
Response: { success: true }
```

## Nginx Configuration

For each tenant, set up a subdomain:

```bash
# SSH to VPS
ssh root@your-vps

# Create config (replace {tenantSlug} with actual slug)
cat > /etc/nginx/conf.d/cms-{tenantSlug}.conf << 'EOF'
server {
    server_name ~^(?<tenant>.+)-auth\.autodealershipcloud\.com$;
    listen 80;
    listen [::]:80;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ~^(?<tenant>.+)-auth\.autodealershipcloud\.com$;

    ssl_certificate /etc/letsencrypt/live/{tenantSlug}-auth.autodealershipcloud.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{tenantSlug}-auth.autodealershipcloud.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header X-Tenant-Slug $tenant;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Validate nginx
nginx -t

# Provision SSL
certbot certonly --nginx -d {tenantSlug}-auth.autodealershipcloud.com

# Reload nginx
nginx -s reload
```

## Testing

### Local Development

1. Add to `/etc/hosts` on your machine:
   ```
   127.0.0.1 myautodealer-auth.localhost
   ```

2. Visit `http://myautodealer-auth.localhost:3002`

3. Login with demo credentials:
   - Email: `admin@example.com`
   - Password: `password`

### Production Testing

1. Create tenant in admin panel
2. Deploy tenant record to database
3. Set up nginx config (see above)
4. Visit `{tenantSlug}-auth.autodealershipcloud.com`
5. Login and verify pages appear

## Deployment

### Local → VPS

```bash
# Build locally
npm run build

# Commit and push
git add .
git commit -m "Add CMS app"
git push origin main

# On VPS
cd /var/www/autodealercloud
git pull origin main
cd apps/cms
npm install
npm run build

# Start with PM2
pm2 start npm --name cms -- start -- -p 3002
pm2 save
```

## Performance Considerations

- SSR (Server-Side Rendering): Enabled by default in Next.js
- Cache pages with tenant slug in key
- Use Next.js Image component for media
- Lazy load heavy components (page editor, component builder)
- Implement pagination for large page lists

## Security

- ✅ JWT authentication on all routes
- ✅ Tenant isolation via request headers
- ✅ HTTPS only (via nginx)
- ✅ Secure headers configured
- ⚠️ TODO: CSRF protection
- ⚠️ TODO: Rate limiting on login
- ⚠️ TODO: Password hashing (use bcrypt)
- ⚠️ TODO: Email verification for new users

## Common Issues

### "Tenant slug not found in request headers"
- Ensure nginx is passing `X-Tenant-Slug` header
- Check middleware.ts is processing headers correctly

### Pages list is empty but pages exist in DB
- Check API endpoint is returning correct tenant filter
- Verify JWT token is included in requests
- Check tenantId matches between frontend and database

### SSL certificate fails to provision
- Ensure domain DNS points to VPS
- Check firewall allows port 80 and 443
- Verify nginx is running before certbot

## Future Enhancements

- [ ] Page builder with drag-and-drop
- [ ] WYSIWYG editor
- [ ] Component library system
- [ ] Template management
- [ ] Version history/rollback
- [ ] Team collaboration (comments, mentions)
- [ ] SEO optimization tools
- [ ] Analytics integration
- [ ] A/B testing
- [ ] Scheduled publishing
