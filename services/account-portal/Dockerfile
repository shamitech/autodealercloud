FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install root dependencies (this installs workspace dependencies too)
RUN npm install

# Copy application code for this service
COPY services/account-portal/src ./services/account-portal/src
COPY services/account-portal/package.json ./services/account-portal/
COPY services/account-portal/tsconfig.json ./services/account-portal/

# Copy root tsconfig
COPY tsconfig.json ./

# Install service-specific dependencies
WORKDIR /app/services/account-portal
RUN npm install

# Go back to app root for building
WORKDIR /app

# Build the TypeScript for this service
RUN npm run build --prefix services/account-portal

# Expose port
EXPOSE 3002

# Start service using npm --prefix to use service package.json
CMD ["npm", "--prefix", "services/account-portal", "start"]
