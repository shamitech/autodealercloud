FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install root dependencies (this installs workspace dependencies too)
RUN npm install

# Copy application code for this service
COPY services/admin-portal/src ./services/admin-portal/src
COPY services/admin-portal/package.json ./services/admin-portal/
COPY services/admin-portal/tsconfig.json ./services/admin-portal/

# Copy root tsconfig
COPY tsconfig.json ./

# Install service-specific dependencies
WORKDIR /app/services/admin-portal
RUN npm install

# Go back to app root for building
WORKDIR /app

# Build the TypeScript for this service
RUN npm run build --prefix services/admin-portal

# Expose port
EXPOSE 3003

# Start service using npm --prefix to use service package.json
CMD ["npm", "--prefix", "services/admin-portal", "start"]
