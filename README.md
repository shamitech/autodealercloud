# AutoDealerCloud - Multi-tenant SaaS Platform

A comprehensive SaaS platform for auto dealership website management with component-based architecture, multi-tenant support, and visual CMS.

## 🏗️ Project Structure

```
autodealercloud/
├── apps/
│   ├── marketing-site/          # Public marketing site (autodealercloud.com)
│   ├── admin-panel/             # Admin dashboard (admin.autodealercloud.com)
│   ├── tenant-cms/              # Multi-tenant CMS/webbuilder
│   └── api/                     # Fastify backend API
├── packages/
│   ├── database/                # Prisma schemas & migrations
│   ├── shared-components/       # Reusable atoms, molecules, organisms
│   ├── ui-kit/                  # React UI components
│   └── types/                   # TypeScript shared types
├── infrastructure/
│   ├── docker/                  # Docker & Docker Compose configs
│   └── nginx-configs/           # Nginx configuration templates
└── docs/                        # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 14+
- Docker (for local development)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev
```

## 📦 Apps

### Marketing Site (`apps/marketing-site`)
Public-facing website showcasing AutoDealerCloud features and benefits.

- Hero section with clear value proposition
- Features & benefits showcase
- Case studies section
- Contact forms with callback requests
- Demo request flow
- Modern, responsive design

### Admin Panel (`apps/admin-panel`)
Private dashboard for AutoDealerCloud administrators.

**Features:**
- Tenant account creation & management
- Domain/subdomain configuration
- Analytics & performance monitoring
- Component library builder (atoms, molecules, organisms)
- Tenant analytics dashboard

### Tenant CMS (`apps/tenant-cms`)
Multi-tenant web builder and content management system for auto dealers.

**Features:**
- JSON-driven content structure
- Visual page builder
- Template system
- Component builder (custom combinations of core components)
- Content sidebar for inline editing
- File tree navigation
- Component library integration
- Page templates

### API (`apps/api`)
Backend API service built with Fastify.

**Features:**
- Multi-tenant isolation
- Authentication & authorization
- Component versioning system
- Content management
- Domain management
- Analytics aggregation
- File storage integration

## 📚 Packages

### `packages/database`
Prisma ORM setup with multi-tenant schema design.

**Models:**
- Tenant
- User
- Component (atoms, molecules, organisms)
- Page & PageTemplate
- Content
- Domain
- ComponentVersion

### `packages/shared-components`
Reusable component library (atoms, molecules, organisms) that all tenants have access to.

**Structure:**
```
shared-components/
├── atoms/           # Basic building blocks (button, input, text, image, etc.)
├── molecules/       # Combinations of atoms (form-group, card, header, etc.)
└── organisms/       # Complex UI sections (navbar, footer, hero, etc.)
```

### `packages/ui-kit`
Shared React components used across all applications.

### `packages/types`
Shared TypeScript types and interfaces.

## 🗄️ Database Schema

### Key Tables:
- **tenants** - Tenant organizations
- **users** - Users with roles (admin, tenant-admin, tenant-editor)
- **components** - Core and custom components
- **component_versions** - Component versioning system
- **pages** - Page definitions
- **page_templates** - Reusable page templates
- **content** - JSON content entries
- **domains** - Custom domain mappings
- **analytics** - Analytics events

## 🐳 Docker Setup

```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🔄 Multi-tenant Architecture

### Tenant Isolation:
- Database-level: Row-level security with tenant_id
- Subdomain-based access: `{tenant-slug}-auth.autodealercloud.com`
- Publisher environment: `{tenant-slug}-pub.autodealercloud.com`
- Custom domain support with Nginx routing

### Component System:
- **Atoms**: Button, Input, Image, Text, etc.
- **Molecules**: FormGroup, Card, Hero, etc.
- **Organisms**: Header, Footer, ProductGrid, etc.
- **Custom Components**: Tenants can combine core components into custom reusable units

## 📝 Component Content Structure

Components store content as JSON, allowing modular content management:

```json
{
  "id": "product-card-instance-1",
  "componentType": "product-card",
  "content": {
    "image": { /* image component content */ },
    "teaserContent": { /* teaser component content */ },
    "button": { /* button component content */ }
  }
}
```

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Tenant-scoped permissions
- Admin, Tenant Admin, and Editor roles

## 📊 Analytics

- Page view tracking
- Component usage analytics
- Tenant performance metrics
- Custom event tracking

## 🌐 Deployment

Deploy to your VPS with:
- Docker containers
- Nginx reverse proxy
- SSL/TLS with Let's Encrypt
- PostgreSQL database

See `infrastructure/` for deployment configurations.

## 📖 Documentation

See `docs/` folder for:
- Architecture decisions
- Component development guide
- Multi-tenant implementation details
- Deployment guide
- API documentation

## 📄 License

Proprietary - AutoDealerCloud

## 👥 Support

For support, contact: support@autodealercloud.com

---

**AutoDealerCloud** - Empowering Auto Dealers with Modern Web Solutions
