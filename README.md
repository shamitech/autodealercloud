# AutoDealerCloud

A multi-tenant SaaS platform for automotive dealers to create Lightspeed-connected websites with custom domain support.

## 🚀 Project Status

**Currently in Phase 6** - Dashboard UI Implementation ✅ **COMPLETE**
- ✅ Phase 1: Infrastructure & Server Setup
- ✅ Phase 2: Multi-Tenancy Foundation
- ✅ Phase 3: User Management & Authentication
- ✅ Phase 4: Lightspeed Integration
- ✅ Phase 5: Role-Based Access Control
- ✅ Phase 6: Dashboard UI

## 📂 Project Structure

```
autodealercloud/
├── api/              # Laravel 9 API backend (PHP 8.1)
├── dashboard/        # Vue 3 SPA frontend (Vite)
├── docs/             # Phase documentation and API specs
├── .git/             # Git repository
└── README.md
```

## 🛠️ Tech Stack

- **Backend**: Laravel 9.52.21 with PHP 8.1.34
- **Frontend**: Vue 3 (Vite) with Vue Router, Axios, Pinia
- **Database**: PostgreSQL 13 (shared multi-tenant model)
- **Server**: Nginx on AlmaLinux 2 with SSL (Let's Encrypt)
- **Authentication**: Laravel Sanctum (API tokens)
- **State Management**: Pinia store
- **Styling**: Tailwind CSS
- **Third-party**: Lightspeed Retail API integration

## ✨ Core Features

- **Multi-Tenant Architecture**: Shared database with automatic tenant scoping
  - Subdomain support (e.g., `dealer1.autodealercloud.com`)
  - Custom domain mapping with DNS verification
  
- **User Management & RBAC**
  - 4-role hierarchy: Admin > Editor > Viewer > Member
  - Per-tenant user management
  - Permission matrix system
  
- **Lightspeed Integration**
  - Connect Lightspeed Retail accounts
  - Sync inventory/products to dashboard
  - View and manage product data
  
- **Admin Dashboard**
  - Responsive Vue 3 UI with Tailwind CSS
  - User management interface (admin-only)
  - Domain management with verification
  - Product inventory viewer with Lightspeed sync
  - User profile management
  - Role-based navigation
  
- **API-First Design**
  - 25+ RESTful endpoints
  - Token-based authentication
  - Role-based access control
  - Comprehensive error handling

## 🚀 Getting Started

### Prerequisites

- PHP 8.1+ with Composer
- Node.js 18+ with npm
- PostgreSQL 13+
- Git (for version control)

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/shamitech/autodealercloud.git
cd autodealercloud
```

#### 2. API Backend Setup
```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed    # Seeds test tenants
php artisan serve             # Runs on http://localhost:8000
```

#### 3. Dashboard Frontend Setup
```bash
cd dashboard
npm install
npm run dev                    # Runs on http://localhost:5173
```

#### 4. Login to Dashboard
Navigate to `http://localhost:5173` and use test credentials:
- **Admin**: admin@dealer1.com / password
- **Member**: john@dealer1.com / password

## 🏗️ Architecture

### Multi-Tenant Data Model
```
Shared Database Strategy:
- All tenant data stored in same PostgreSQL database
- Automatic tenant_id filtering via BelongsToTenant trait
- Middleware (IdentifyTenant) resolves tenant from subdomain/custom domain
- Tenant context stored in config['app.tenant_id'] for request lifecycle
```

### Database Schema
- **Tenants**: UUID PK, slug, domain, status
- **Users**: Per-tenant, with roles (admin/editor/viewer/member)
- **Domains**: Custom domain mappings per tenant
- **Products**: Lightspeed inventory synced per tenant

### Authentication Flow
```
1. User submits credentials at /login
2. Dashboard calls POST /api/auth/login
3. API returns Sanctum token + user data
4. Token stored in localStorage
5. Axios interceptor adds token to all requests
6. Router guards check authentication on route change
7. Automatic redirect to login if token invalid/expired
```

### Request Flow for Protected Endpoints
```
Client Request
  ↓
Vue Router Guard (check auth)
  ↓
Axios Request with Bearer Token
  ↓
Laravel Sanctum Middleware
  ↓
IdentifyTenant Middleware (resolve tenant)
  ↓
CheckRole Middleware (validate permissions)
  ↓
API Logic (queries auto-scoped by tenant_id)
  ↓
JSON Response
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (per-tenant)
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/permissions` - Get user permissions

### Users (Admin-only)
- `GET /api/users` - List tenant users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Domains
- `GET /api/domains` - List custom domains
- `POST /api/domains` - Add custom domain
- `POST /api/domains/{id}/verify` - Verify domain ownership
- `DELETE /api/domains/{id}` - Delete domain

### Lightspeed Integration
- `GET /api/lightspeed/status` - Check connection status
- `POST /api/lightspeed/connect` - Connect Lightspeed account
- `POST /api/lightspeed/disconnect` - Disconnect account
- `GET /api/lightspeed/products` - List synced products
- `POST /api/lightspeed/sync-products` - Sync from Lightspeed

See [docs/API.md](docs/API.md) for complete API documentation.

## 📖 Documentation

- [Phase 1: Infrastructure Setup](docs/PHASE_1_SETUP.md)
- [Phase 2: Multi-Tenancy](docs/PHASE_2_MULTITENANCY.md)
- [Phase 3: User Management](docs/PHASE_3_USERS.md)
- [Phase 4: Lightspeed Integration](docs/PHASE_4_LIGHTSPEED.md)
- [Phase 5: RBAC](docs/PHASE_5_RBAC.md)
- [Phase 6: Dashboard UI](docs/PHASE_6_DASHBOARD.md)
- [API Reference](docs/API.md)
- [Server Setup](docs/SETUP.md)

## 🔐 Security

- Sanctum token-based authentication
- Role-based access control (RBAC)
- Per-tenant data isolation
- CORS protection
- SQL injection prevention (Eloquent ORM)
- XSS prevention (Vue auto-escaping)
- CSRF token validation (Laravel)

## 📋 Environment Configuration

### API (.env)
```env
APP_NAME=AutoDealerCloud
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=autodealercloud
DB_USERNAME=postgres
DB_PASSWORD=password
LIGHTSPEED_API_KEY=your_key_here
```

### Dashboard (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 🧪 Testing

### API Testing with curl
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dealer1.com","password":"password"}'

# Get users (with token)
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Host: dealer1.autodealercloud.com"
```

### Dashboard Testing
- Navigate to http://localhost:5173
- Login with admin@dealer1.com / password
- Test all dashboard features
- Check browser console for API errors

## 🌐 Production Deployment

### Server Setup (Completed)
- VPS with AlmaLinux 2
- Nginx reverse proxy
- SSL via Let's Encrypt
- PHP 8.1 with FPM
- PostgreSQL 13

### Production URLs
- **API**: https://api.autodealercloud.com (port 8001)
- **Dashboard**: https://dashboard.autodealercloud.com (port 5173)
- **Tenant Subdomains**: https://dealer1.autodealercloud.com

Deployment commands and configuration are documented in [docs/SETUP.md](docs/SETUP.md)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙋 Support

For issues, questions, or suggestions:
- Check documentation in `/docs`
- Review API reference at [docs/API.md](docs/API.md)
- Check GitHub issues

---

**Last Updated**: Phase 6 Complete (Dashboard UI)  
**Repository**: https://github.com/shamitech/autodealercloud
