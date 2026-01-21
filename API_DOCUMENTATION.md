# AutoDealerCloud API Documentation

## Phase 2A: Core APIs - Account Portal, Admin Portal, Core CMS

### Base URLs
- **Account Portal**: `http://localhost:3002`
- **Admin Portal**: `http://localhost:3003`
- **Core CMS**: `http://localhost:3001`

---

## Account Portal APIs

### Authentication

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "owner@dealership.com",
  "password": "secure-password",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "John's Auto Dealership"
}

Response (201):
{
  "token": "eyJhbGc...",
  "user": { ... },
  "company": { ... }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "owner@dealership.com",
  "password": "secure-password"
}

Response (200):
{
  "token": "eyJhbGc...",
  "user": { ... }
}
```

#### Get Current User
```
GET /auth/me
Authorization: Bearer {token}

Response (200):
{
  "user": { ... },
  "company": { ... }
}
```

#### Refresh Token
```
POST /auth/refresh
Authorization: Bearer {token}

Response (200):
{
  "token": "new-token-here"
}
```

---

### Company Management

#### Get Company Details
```
GET /api/companies/{companyId}
Authorization: Bearer {token}

Response (200):
{
  "id": "uuid",
  "companyId": "c1234567890",
  "name": "John's Auto Dealership",
  "email": "owner@dealership.com",
  "phone": "+1-555-0100",
  "website": "www.johnsauto.com",
  "status": "active",
  "subscriptionPlan": "pro",
  "createdAt": "2026-01-21T...",
  "updatedAt": "2026-01-21T..."
}
```

#### Update Company
```
PUT /api/companies/{companyId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John's Premium Auto Dealership",
  "phone": "+1-555-0101",
  "website": "www.johnspremiumauto.com"
}

Response (200):
{ ... updated company ... }
```

#### Get Company Users
```
GET /api/companies/{companyId}/users
Authorization: Bearer {token}

Response (200):
[
  {
    "id": "uuid",
    "email": "user@dealership.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "editor",
    "status": "active",
    "createdAt": "2026-01-21T...",
    "lastLoginAt": "2026-01-21T..."
  }
]
```

#### Invite User
```
POST /api/companies/{companyId}/users/invite
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newuser@dealership.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "editor"
}

Response (201):
{
  "user": { ... },
  "temporaryPassword": "abcd1234",
  "message": "Invitation sent to user email"
}
```

---

### Environment Management

#### Get Environments
```
GET /api/companies/{companyId}/environments
Authorization: Bearer {token}

Response (200):
[
  {
    "id": "uuid",
    "companyId": "c1234567890",
    "environmentId": "e1234567890",
    "name": "Production",
    "environmentType": "pub",
    "createdAt": "2026-01-21T..."
  },
  {
    "id": "uuid",
    "companyId": "c1234567890",
    "environmentId": "e1234567891",
    "name": "Staging",
    "environmentType": "stage",
    "createdAt": "2026-01-21T..."
  }
]
```

#### Create Environment
```
POST /api/companies/{companyId}/environments
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Development",
  "environmentType": "auth"
}

Response (201):
{
  "id": "uuid",
  "environmentId": "e1234567892",
  "name": "Development",
  "environmentType": "auth",
  ...
}
```

---

### Domain Management

#### Get Company Domains
```
GET /api/domains/company/{companyId}
Authorization: Bearer {token}

Response (200):
[
  {
    "id": "uuid",
    "domainName": "www.mydealership.com",
    "environmentType": "pub",
    "isPrimary": true,
    "dnsConfigured": true,
    "verifiedAt": "2026-01-21T...",
    "createdAt": "2026-01-21T..."
  }
]
```

#### Add Custom Domain
```
POST /api/domains
Authorization: Bearer {token}
Content-Type: application/json

{
  "environmentId": "uuid",
  "domainName": "www.mydealership.com",
  "isPrimary": true
}

Response (201):
{
  "id": "uuid",
  "domainName": "www.mydealership.com",
  "dnsConfigured": false,
  ...
}
```

#### Get DNS Instructions
```
GET /api/domains/{domainId}/dns-instructions
Authorization: Bearer {token}

Response (200):
{
  "instructions": [
    {
      "type": "CNAME",
      "name": "www",
      "value": "autodealercloud.com",
      "ttl": 3600
    }
  ],
  "timeToPropagate": "24-48 hours"
}
```

#### Verify Domain
```
POST /api/domains/{domainId}/verify
Authorization: Bearer {token}

Response (200):
{
  "domain": { ... },
  "message": "Domain verified successfully"
}
```

#### Delete Domain
```
DELETE /api/domains/{domainId}
Authorization: Bearer {token}

Response (200):
{
  "message": "Domain deleted"
}
```

---

## Admin Portal APIs

### Authentication

#### Admin Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "admin@autodealercloud.com",
  "password": "admin-password"
}

Response (200):
{
  "token": "eyJhbGc...",
  "admin": { ... }
}
```

#### Get Current Admin
```
GET /auth/me
Authorization: Bearer {token}

Response (200):
{
  "id": "uuid",
  "email": "admin@autodealercloud.com",
  "firstName": "Admin",
  "lastName": "User",
  "role": "super_admin",
  "status": "active",
  ...
}
```

---

### Tenant Management

#### Get All Tenants
```
GET /api/tenants?limit=100&offset=0
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "externalCompanyId": "c1234567890",
      "name": "John's Auto Dealership",
      "email": "owner@dealership.com",
      "status": "active",
      "subscriptionPlan": "pro",
      "subscriptionExpiresAt": "2026-12-31T..."
    }
  ],
  "limit": 100,
  "offset": 0,
  "total": 1
}
```

#### Get Tenant Details
```
GET /api/tenants/{tenantId}
Authorization: Bearer {token}

Response (200):
{ ... tenant details ... }
```

#### Create Tenant
```
POST /api/tenants
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Dealership",
  "email": "owner@newdealership.com",
  "contactEmail": "contact@newdealership.com",
  "contactPhone": "+1-555-0200",
  "subscriptionPlan": "basic"
}

Response (201):
{ ... created tenant ... }
```

#### Update Tenant
```
PUT /api/tenants/{tenantId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Dealership Name",
  "subscriptionPlan": "premium"
}

Response (200):
{ ... updated tenant ... }
```

#### Suspend Tenant
```
POST /api/tenants/{tenantId}/suspend
Authorization: Bearer {token}

Response (200):
{
  "tenant": { ... },
  "message": "Tenant suspended"
}
```

#### Activate Tenant
```
POST /api/tenants/{tenantId}/activate
Authorization: Bearer {token}

Response (200):
{
  "tenant": { ... },
  "message": "Tenant activated"
}
```

---

## Core CMS APIs

### Pages

#### Get All Pages for Environment
```
GET /api/pages/env/{environmentId}?limit=100&offset=0
Authorization: Bearer {token}

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "environmentId": "uuid",
      "title": "Home Page",
      "slug": "home",
      "metaTitle": "Welcome to Our Dealership",
      "metaDescription": "Premium auto sales",
      "sections": [ ... ],
      "status": "published",
      "createdAt": "2026-01-21T...",
      "updatedAt": "2026-01-21T...",
      "publishedAt": "2026-01-21T..."
    }
  ],
  "limit": 100,
  "offset": 0
}
```

#### Get Page by ID
```
GET /api/pages/{pageId}
Authorization: Bearer {token}

Response (200):
{ ... page details ... }
```

#### Get Page by Slug
```
GET /api/pages/env/{environmentId}/slug/{slug}
Authorization: Bearer {token}

Response (200):
{ ... page details ... }
```

#### Create Page
```
POST /api/pages
Authorization: Bearer {token}
Content-Type: application/json

{
  "environmentId": "uuid",
  "title": "Home Page",
  "slug": "home",
  "sections": [
    {
      "id": "section-1",
      "componentId": "header",
      "config": { ... }
    }
  ]
}

Response (201):
{ ... created page ... }
```

#### Update Page
```
PUT /api/pages/{pageId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "sections": [ ... ],
  "metaDescription": "Updated description"
}

Response (200):
{ ... updated page ... }
```

#### Publish Page
```
POST /api/pages/{pageId}/publish
Authorization: Bearer {token}

Response (200):
{
  "page": { ... },
  "message": "Page published successfully"
}
```

#### Delete Page
```
DELETE /api/pages/{pageId}
Authorization: Bearer {token}

Response (200):
{
  "message": "Page deleted"
}
```

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "error": "Error description"
}
```

Common HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer {token}
```

Tokens are JWT tokens with 7-day expiration by default.
