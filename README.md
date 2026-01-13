# AutoDealerCloud

A multi-tenant SaaS platform for automotive dealers to create Lightspeed-connected websites with custom domain support.

## Project Structure

```
autodealercloud/
├── api/              # Laravel API backend
├── dashboard/        # Vue 3 SPA frontend
├── docs/             # Documentation
└── README.md
```

## Tech Stack

- **Backend**: Laravel 11+ with PHP 8.1+
- **Frontend**: Vue 3 with TypeScript
- **Database**: PostgreSQL
- **Server**: Nginx on AlmaLinux 2
- **Containerization**: Docker & Docker Compose

## Features

- Multi-tenant architecture with subdomain support
- Custom domain mapping (CNAME/A record support)
- Lightspeed Retail API integration
- Real-time website customization
- Domain management dashboard

## Getting Started

### Prerequisites

- PHP 8.1+
- Node.js 18+
- PostgreSQL 13+
- Docker & Docker Compose (for development)
- Nginx (for production)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shamitech/autodealercloud.git
   cd autodealercloud
   ```

2. **Backend Setup**
   ```bash
   cd api
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan serve
   ```

3. **Frontend Setup**
   ```bash
   cd dashboard
   npm install
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:8000`

## Multi-Tenant Architecture

- **Root Domain**: Hosts the core application
- **Subdomains**: Each client gets `{clientslug}.autodealercloud.app`
- **Custom Domains**: Clients can point their own domains via CNAME/A record

## Environment Configuration

Create `.env` files in both `api/` and `dashboard/` directories. See `.env.example` files for required variables.

### Key Environment Variables

- `LIGHTSPEED_API_KEY` - Lightspeed API authentication
- `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` - PostgreSQL connection
- `VITE_API_URL` - API endpoint for frontend
- `APP_TENANT_DOMAIN` - Main application domain

## Database

Multi-tenant data isolation strategy:
- Shared PostgreSQL database with `tenant_id` column in all tables
- Automatic tenant resolution via domain/subdomain

## Nginx Configuration

SeeServer Setup

This repository contains the application code only. For server configuration and deployment:
- Nginx configuration is managed separately on `/var/www/autodealercloud/nginx/`
- See [docs/SETUP.md](docs/SETUP.md) for production deployment commands and setup

API endpoints are documented in [docs/API.md](docs/API.md)

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT License - see LICENSE file for details
