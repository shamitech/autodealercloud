FROM node:20-alpine

WORKDIR /app

COPY api/package*.json ./

RUN npm install

COPY api .

# Copy Prisma schema from shared packages directory
COPY packages/database/prisma ./prisma

# Build TypeScript
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
