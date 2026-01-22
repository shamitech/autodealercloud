FROM node:18-alpine

WORKDIR /app

COPY services/publisher-api/package*.json ./

RUN npm ci --only=production

COPY services/publisher-api/dist ./dist

EXPOSE 3030

CMD ["node", "dist/index.js"]
