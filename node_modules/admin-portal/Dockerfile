FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/admin-portal/src ./services/admin-portal/src
COPY services/admin-portal/package.json ./services/admin-portal/
COPY tsconfig.json ./
COPY services/admin-portal/tsconfig.json ./services/admin-portal/

# Build the TypeScript for this service
RUN npm run build --prefix services/admin-portal

# Expose port
EXPOSE 3003

# Start service using npm --prefix to use service package.json
CMD ["npm", "--prefix", "services/admin-portal", "start"]
