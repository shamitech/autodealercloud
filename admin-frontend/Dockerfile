FROM node:20-alpine

WORKDIR /app

COPY admin-frontend/package*.json ./

RUN npm install

COPY admin-frontend . 

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
