FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/domain-router/src ./services/domain-router/src
COPY services/domain-router/package.json ./services/domain-router/
COPY tsconfig.json ./
COPY services/domain-router/tsconfig.json ./services/domain-router/

# Build the TypeScript for this service
RUN npm run build --prefix services/domain-router

# Expose port
EXPOSE 80

# Start service using npm --prefix to use service package.json
CMD ["npm", "--prefix", "services/domain-router", "start"]
