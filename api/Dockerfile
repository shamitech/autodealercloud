FROM node:20-alpine

WORKDIR /app

COPY api/package*.json ./

RUN npm install

COPY api . 

# Copy Prisma schema from shared packages directory
COPY packages/database/prisma ./prisma

RUN npm run build && npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]
