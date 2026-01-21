# API Testing Guide

## Base URLs
- **Core CMS**: https://autodealercloud.com (or http://localhost:3001)
- **Account Portal**: https://account.autodealercloud.com (or http://localhost:3002)
- **Admin Portal**: https://admin.autodealercloud.com (or http://localhost:3003)

## 1. Health Checks

### Core CMS Health
```bash
curl -X GET http://localhost:3001/health
```

### Account Portal Health
```bash
curl -X GET http://localhost:3002/health
```

### Admin Portal Health
```bash
curl -X GET http://localhost:3003/health
```

Expected response:
```json
{"status": "running"}
```

## 2. Account Portal - User Management

### Create a Company
```bash
curl -X POST http://localhost:3002/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "company-001",
    "company_name": "Test Dealership",
    "email": "admin@testdealership.com",
    "password": "SecurePassword123!",
    "phone": "+1-555-0123",
    "website": "https://testdealership.com"
  }'
```

### User Login
```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@testdealership.com",
    "password": "SecurePassword123!"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "admin@testdealership.com",
    "company_id": "uuid"
  }
}
```

### List Companies
```bash
curl -X GET http://localhost:3002/api/companies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 3. Domain Management

### Create a Domain
```bash
curl -X POST http://localhost:3002/api/domains \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "company_id": "your-company-uuid",
    "environment_id": "your-environment-uuid",
    "domain_name": "subdomain.yourdealership.com",
    "is_primary": true
  }'
```

### List Domains
```bash
curl -X GET http://localhost:3002/api/domains \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Verify Domain DNS
```bash
curl -X PUT http://localhost:3002/api/domains/{domain_id}/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"dns_records": [...]}'
```

## 4. Core CMS - Content Management

### Create a Page
```bash
curl -X POST http://localhost:3001/api/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "environment_id": "your-environment-uuid",
    "title": "Home Page",
    "slug": "home",
    "meta_title": "Welcome to Our Dealership",
    "meta_description": "Browse our inventory",
    "sections": []
  }'
```

### List Pages
```bash
curl -X GET http://localhost:3001/api/pages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Page
```bash
curl -X PUT http://localhost:3001/api/pages/{page_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Home - Updated",
    "sections": [...]
  }'
```

### Publish Page
```bash
curl -X POST http://localhost:3001/api/pages/{page_id}/publish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "published_by": "your-user-id"
  }'
```

## 5. Admin Portal - System Management

### Admin Login
```bash
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@autodealercloud.com",
    "password": "admin-password"
  }'
```

### List Managed Tenants
```bash
curl -X GET http://localhost:3003/api/tenants \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Create System Setting
```bash
curl -X POST http://localhost:3003/api/tenants/{tenant_id}/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "setting_key": "feature_flag_advanced_pages",
    "setting_value": true
  }'
```

## 6. Quick Test - Health Check (No Auth Required)

Try this first to verify services are responding:

```bash
# Test Core CMS
curl -s http://localhost:3001/ | jq .

# Test Account Portal  
curl -s http://localhost:3002/ | jq .

# Test Admin Portal
curl -s http://localhost:3003/ | jq .
```

All should return JSON responses confirming they're running.

## 7. Create a Test User (Quick Start)

Replace credentials and run on your machine:

```bash
# 1. Create company/user
curl -X POST http://localhost:3002/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "test-auto-'$(date +%s)'",
    "company_name": "My Test Dealership",
    "email": "owner@testdealership.local",
    "password": "Password123!",
    "phone": "+1-555-0100",
    "website": "http://example.com"
  }'

# 2. Login to get token
RESPONSE=$(curl -s -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@testdealership.local",
    "password": "Password123!"
  }')

TOKEN=$(echo $RESPONSE | jq -r '.token')
echo "Your token: $TOKEN"

# 3. List your companies
curl -s -X GET http://localhost:3002/api/companies \
  -H "Authorization: Bearer $TOKEN" | jq .
```

## 8. Troubleshooting

### Services not responding?
```bash
# Check if containers are running
ssh root@185.146.166.77 "docker ps"

# View logs
ssh root@185.146.166.77 "docker logs autodealercloud-core-cms-1"
ssh root@185.146.166.77 "docker logs autodealercloud-account-portal-1"
ssh root@185.146.166.77 "docker logs autodealercloud-admin-portal-1"
```

### Database connection issues?
```bash
# Check PostgreSQL is running
ssh root@185.146.166.77 "docker ps | grep postgres"

# Test database connection
ssh root@185.146.166.77 "PGPASSWORD=password psql -U user -h localhost -p 5435 -d autodealercloud -c 'SELECT 1'"
```

### JWT token expired?
- Re-login to get a fresh token
- Tokens last 24 hours by default

### 404 errors on endpoints?
- Check route implementations in service source code
- Verify the endpoint exists in the routes folder
- Check the exact URL path and method (GET/POST/PUT/DELETE)
