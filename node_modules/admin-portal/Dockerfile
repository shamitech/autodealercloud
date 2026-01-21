FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install root dependencies (this installs workspace dependencies too)
RUN npm install

# Copy root tsconfig
COPY tsconfig.json ./

# Copy service package.json and tsconfig FIRST (before src) so npm install picks up all deps
COPY services/admin-portal/package.json ./services/admin-portal/
COPY services/admin-portal/tsconfig.json ./services/admin-portal/

# Install service-specific dependencies
WORKDIR /app/services/admin-portal
RUN npm install

# Now copy application source code
WORKDIR /app
COPY services/admin-portal/src ./services/admin-portal/src

# Build the TypeScript for this service
RUN npm run build --prefix services/admin-portal

# Expose port
EXPOSE 3003

# Start service using npm --prefix to use service package.json
CMD ["npm", "--prefix", "services/admin-portal", "start"]
