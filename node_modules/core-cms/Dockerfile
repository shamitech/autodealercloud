FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install root dependencies (this installs workspace dependencies too)
RUN npm install

# Copy application code for this service
COPY services/core-cms/src ./services/core-cms/src
COPY services/core-cms/package.json ./services/core-cms/
COPY services/core-cms/tsconfig.json ./services/core-cms/

# Copy root tsconfig
COPY tsconfig.json ./

# Install service-specific dependencies
WORKDIR /app/services/core-cms
RUN npm install

# Go back to app root for building
WORKDIR /app

# Build the TypeScript for this service
RUN npm run build --prefix services/core-cms

# Expose port
EXPOSE 3001

# Start service using npm --prefix to use service package.json
CMD ["npm", "--prefix", "services/core-cms", "start"]
