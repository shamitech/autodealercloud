FROM node:18-alpine

WORKDIR /app

COPY services/cms-api/package*.json ./

RUN npm ci --only=production

COPY services/cms-api/dist ./dist

EXPOSE 3020

CMD ["node", "dist/index.js"]
