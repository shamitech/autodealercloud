#!/bin/bash

# Install dependencies for all services
echo "🚀 Installing dependencies for AutoDealerCloud..."

# Backend services
echo "📦 Installing admin-api dependencies..."
cd services/admin-api && npm install && cd ../..

echo "📦 Installing cms-api dependencies..."
cd services/cms-api && npm install && cd ../..

echo "📦 Installing publisher-api dependencies..."
cd services/publisher-api && npm install && cd ../..

# Frontend services
echo "📦 Installing admin-dashboard dependencies..."
cd services/admin-dashboard && npm install && cd ../..

echo "📦 Installing cms-dashboard dependencies..."
cd services/cms-dashboard && npm install && cd ../..

echo "📦 Installing publisher dependencies..."
cd services/publisher && npm install && cd ../..

echo "✅ All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Create PostgreSQL databases:"
echo "   createdb admin_db"
echo "   createdb cms_db"
echo "   createdb publisher_db"
echo ""
echo "2. Configure environment variables:"
echo "   cp .env.example .env.local"
echo "   # Edit .env.local with your settings"
echo ""
echo "3. Run each service in separate terminals:"
echo "   cd services/admin-api && npm run dev"
echo "   cd services/cms-api && npm run dev"
echo "   cd services/publisher-api && npm run dev"
echo "   cd services/admin-dashboard && npm run dev"
echo "   cd services/cms-dashboard && npm run dev"
echo "   cd services/publisher && npm run dev"
