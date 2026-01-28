FROM node:20-alpine

WORKDIR /app

COPY api/package*.json ./

RUN npm install

COPY api .

# Copy Prisma schema from shared packages directory
COPY packages/database/prisma ./prisma

# Build TypeScript
RUN npm run build

# Set dummy DATABASE_URL for Prisma client generation at runtime
ENV DATABASE_URL="postgresql://admin:postgres@localhost:5432/dummy"

# Pre-generate Prisma client
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/index.js"]
