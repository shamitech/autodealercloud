FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install root dependencies (this installs workspace dependencies too)
RUN npm install

# Copy root tsconfig
COPY tsconfig.json ./

# Copy service package.json and tsconfig FIRST (before src) so npm install picks up all deps
COPY services/account-portal/package.json ./services/account-portal/
COPY services/account-portal/tsconfig.json ./services/account-portal/

# Install service-specific dependencies in its own node_modules
WORKDIR /app/services/account-portal
RUN npm install

# Install @types packages at root level so TypeScript compiler can find them
WORKDIR /app
RUN npm install --save-dev @types/cors@2.8.17 @types/uuid@9.0.7 @types/socket.io@3.0.2

# Now copy application source code
COPY services/account-portal/src ./services/account-portal/src

# Build the TypeScript for this service
RUN npm run build --prefix services/account-portal

# Expose port
EXPOSE 3002

# Start service using npm --prefix to use service package.json
CMD ["npm", "--prefix", "services/account-portal", "start"]
