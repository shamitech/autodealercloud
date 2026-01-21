FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/admin-portal/src ./src
COPY tsconfig.json ./
COPY services/admin-portal/tsconfig.json ./tsconfig-service.json

# Expose port
EXPOSE 3003

# Start service
CMD ["npm", "start"]
