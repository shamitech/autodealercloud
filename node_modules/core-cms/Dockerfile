FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/core-cms/src ./src
COPY services/core-cms/package.json ./services/core-cms/
COPY tsconfig.json ./
COPY services/core-cms/tsconfig.json ./tsconfig-service.json

# Expose port
EXPOSE 3001

# Start service using npm --prefix to use service package.json
CMD ["npm", "--prefix", "services/core-cms", "start"]
