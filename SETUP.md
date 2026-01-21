# Environment setup guide

## Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL (optional if using Docker)

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment files
Each service has a `.env.example` file. Copy these to `.env` and update values:

```bash
cd services/core-cms && cp .env.example .env && cd ../..
cd services/account-portal && cp .env.example .env && cd ../..
cd services/admin-portal && cp .env.example .env && cd ../..
cd services/domain-router && cp .env.example .env && cd ../..
```

### 3. Development mode (without Docker)
In separate terminals, run:

```bash
# Terminal 1: Core CMS
cd services/core-cms && npm run dev

# Terminal 2: Account Portal
cd services/account-portal && npm run dev

# Terminal 3: Admin Portal
cd services/admin-portal && npm run dev

# Terminal 4: Domain Router (requires sudo on port 80)
cd services/domain-router && npm run dev
```

### 4. Production mode with Docker
```bash
docker-compose up -d
```

## Database Setup

Each service uses its own PostgreSQL database. Configure in `.env` files:
- Core CMS: `localhost:5432`
- Account Portal: `localhost:5433`
- Admin Portal: `localhost:5434`

## Testing Services

Once running, test endpoints:
- Core CMS: `http://localhost:3001/health`
- Account Portal: `http://localhost:3002/health`
- Admin Portal: `http://localhost:3003/health`

## Architecture Overview

```
┌─────────────────────────────────────────┐
│        Domain Router (Port 80)          │
│   Routes based on host/domain name      │
└──────┬──────────────┬──────────────┬────┘
       │              │              │
   ┌───▼────┐   ┌────▼──────┐  ┌───▼─────┐
   │Core CMS│   │  Account  │  │  Admin  │
   │ Port   │   │  Portal   │  │ Portal  │
   │ 3001   │   │  Port 3002│  │ Port3003│
   └───┬────┘   └────┬──────┘  └───┬─────┘
       │             │             │
       └─────────────┴─────────────┘
              PostgreSQL
         (3 separate DBs)
```

## Next Steps

1. Implement database schemas for each service
2. Create authentication middleware
3. Build page builder UI (React)
4. Implement real-time collaboration (Socket.io)
5. Set up deployment pipeline
