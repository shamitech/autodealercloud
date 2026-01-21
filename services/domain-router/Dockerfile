FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install root dependencies (this installs workspace dependencies too)
RUN npm install

# Copy root tsconfig
COPY tsconfig.json ./

# Copy service package.json and tsconfig FIRST (before src) so npm install picks up all deps
COPY services/domain-router/package.json ./services/domain-router/
COPY services/domain-router/tsconfig.json ./services/domain-router/

# Install service-specific dependencies
WORKDIR /app/services/domain-router
RUN npm install

# Now copy application source code
WORKDIR /app
COPY services/domain-router/src ./services/domain-router/src

# Build the TypeScript for this service
RUN npm run build --prefix services/domain-router

# Expose port
EXPOSE 80

# Start service using npm --prefix to use service package.json
CMD ["npm", "--prefix", "services/domain-router", "start"]
