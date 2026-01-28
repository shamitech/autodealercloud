FROM node:18-alpine

WORKDIR /app

COPY services/admin-api/package*.json ./

RUN npm ci --only=production

COPY services/admin-api/dist ./dist

EXPOSE 3010

CMD ["node", "dist/index.js"]
