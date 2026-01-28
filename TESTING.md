# Testing Checklist - AutoDealerCloud

## Manual Testing Guide

### 1. Admin API Testing

#### Health Check
```bash
curl http://localhost:3010/health
# Expected: { "status": "ok", "service": "admin-api" }
```

#### Admin Registration
```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@autodealercloud.com","password":"admin123"}'
# Expected: { "token": "jwt_token", "user": {...} }
```

#### Create Tenant
```bash
curl -X POST http://localhost:3010/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Example Dealership",
    "slug": "example",
    "email": "contact@example.com",
    "contact_first_name": "John",
    "contact_last_name": "Doe"
  }'
# Expected: { "tenant": {...}, "tempPassword": "Tmp_..." }
```

#### List Tenants
```bash
curl http://localhost:3010/api/tenants \
  -H "Authorization: Bearer <token>"
# Expected: Array of tenants
```

### 2. CMS API Testing

#### Tenant Login
```bash
curl -X POST http://localhost:3011/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"contact@example.com","password":"Tmp_..."}'
# Expected: { "token": "jwt_token", "user": {...} }
```

#### Create Component
```bash
curl -X POST http://localhost:3011/api/components \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Hero Banner",
    "description": "Hero section component",
    "category": "hero",
    "configuration": {
      "backgroundColor": "#000",
      "textColor": "#fff"
    }
  }'
# Expected: { "id": "...", "name": "Hero Banner", ... }
```

#### Create Page
```bash
curl -X POST http://localhost:3011/api/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Home",
    "slug": "home",
    "description": "Home page",
    "content": {
      "sections": [{
        "type": "hero",
        "componentId": "<component_id>"
      }]
    }
  }'
# Expected: { "id": "...", "title": "Home", "status": "draft" }
```

#### Publish Page
```bash
curl -X POST http://localhost:3011/api/pages/<page_id>/publish \
  -H "Authorization: Bearer <token>"
# Expected: { "id": "...", "status": "published", "published_at": "..." }
```

### 3. Publisher API Testing

#### Get Published Page
```bash
curl http://localhost:3012/api/pages/example/home
# Expected: { "id": "...", "title": "Home", "content": {...} }
```

#### Get Tenant Pages
```bash
curl http://localhost:3012/api/pages/example
# Expected: Array of published pages
```

### 4. Admin Dashboard Testing (UI)

1. **Login**
   - Navigate to http://localhost:3000/login
   - Enter admin credentials
   - Should redirect to dashboard

2. **Create Tenant**
   - Go to Tenants page
   - Click "Create Tenant"
   - Fill form and submit
   - Should show success with temp password

3. **View Tenants**
   - List should show all created tenants
   - Click Edit to update tenant details
   - Click Delete to remove tenant

### 5. CMS Dashboard Testing (UI)

1. **Login**
   - Navigate to http://localhost:3001/login
   - Enter tenant credentials (from admin)
   - Should redirect to CMS pages

2. **Create Component**
   - Go to Components
   - Click "Create Component"
   - Fill form with component details
   - Should appear in list

3. **Create Page**
   - Go to Pages
   - Click "Create Page"
   - Fill page details
   - Should appear in draft status

4. **Publish Page**
   - Click page to edit
   - Click "Publish"
   - Should show published status

### 6. Publisher Testing (UI)

1. **Home Page**
   - Navigate to http://localhost:3002
   - Should show welcome page

2. **Published Page**
   - Navigate to http://localhost:3002/example/home
   - Should show published page content
   - Check SEO meta tags in page source

## Automated Testing (Future)

### Unit Tests
```bash
# Run admin API tests
cd services/admin-api && npm test

# Run CMS API tests
cd services/cms-api && npm test

# Run publisher API tests
cd services/publisher-api && npm test
```

### Integration Tests
```bash
# Test full tenant provisioning workflow
npm run test:integration:provision

# Test page publishing workflow
npm run test:integration:publish
```

### E2E Tests
```bash
# Test complete user journey
npm run test:e2e
```

## Database Verification

### Check Admin Database
```bash
docker exec autodealercloud-postgres-admin psql -U autodealercloud -d admin_db -c "
  SELECT 'Admin Users' as table_name, COUNT(*) FROM admin_users
  UNION ALL
  SELECT 'Tenants', COUNT(*) FROM tenants
  UNION ALL
  SELECT 'Audit Logs', COUNT(*) FROM audit_logs;
"
```

### Check CMS Database
```bash
docker exec autodealercloud-postgres-cms psql -U autodealercloud -d cms_db -c "
  SELECT schema_name FROM information_schema.schemata 
  WHERE schema_name LIKE 'tenant_%';
"
```

### Check Publisher Database
```bash
docker exec autodealercloud-postgres-publisher psql -U autodealercloud -d publisher_db -c "
  SELECT COUNT(*) FROM published_pages;
"
```

## Performance Benchmarks

### Load Testing
```bash
# Test admin API with 100 requests
ab -n 100 -c 10 http://localhost:3010/api/tenants

# Test CMS API
ab -n 100 -c 10 http://localhost:3011/api/components

# Test publisher
ab -n 100 -c 10 http://localhost:3012/api/pages/example
```

## Error Scenarios

### Test Invalid Credentials
```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"wrong"}'
# Expected: { "error": "Invalid credentials" } with 401 status
```

### Test Duplicate Slug
```bash
# Create tenant with slug "test"
# Try to create another with same slug
# Expected: { "error": "Slug already exists" } with 400 status
```

### Test Unauthorized Access
```bash
curl http://localhost:3010/api/tenants \
  -H "Authorization: Bearer invalid_token"
# Expected: { "error": "Unauthorized" } with 401 status
```

### Test Missing Required Fields
```bash
curl -X POST http://localhost:3010/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Test"}'
# Expected: { "error": "Missing required fields" } with 400 status
```

## Deployment Verification

### VPS Testing Checklist

- [ ] SSH access to VPS
- [ ] Docker containers running
- [ ] All 3 databases accessible
- [ ] Admin dashboard accessible
- [ ] Can create tenant via UI
- [ ] Nginx config generated for new tenant
- [ ] Published site accessible at subdomain
- [ ] Logs are being written correctly
- [ ] Backups can be created
- [ ] Services restart on failure

## Monitoring & Logs

### View Service Logs
```bash
# Admin API
docker-compose logs -f admin-api

# CMS API
docker-compose logs -f cms-api

# Publisher API
docker-compose logs -f publisher-api

# Database
docker-compose logs -f postgres-admin
```

### Check System Resources
```bash
docker stats

# Memory usage
docker exec <container> free -h

# Disk usage
docker exec <container> df -h
```

## Sign-Off Checklist

- [ ] All APIs responding correctly
- [ ] Authentication working for admin and tenants
- [ ] Tenant provisioning creates database schema
- [ ] Pages can be created, updated, and published
- [ ] Published pages accessible via public URL
- [ ] Nginx configurations auto-generating
- [ ] No errors in service logs
- [ ] Database integrity verified
- [ ] Performance acceptable
- [ ] Security checks passed
- [ ] Documentation complete
- [ ] Deployment guide tested

---

**Last Updated**: January 2024
**Tested On**: Ubuntu 22.04 LTS
**Tested With**: Docker, Docker Compose 2.x, Node.js 18.x
