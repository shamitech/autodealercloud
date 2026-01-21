FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/account-portal/src ./services/account-portal/src
COPY services/account-portal/package.json ./services/account-portal/
COPY tsconfig.json ./
COPY services/account-portal/tsconfig.json ./services/account-portal/

# Build the TypeScript for this service
RUN npm run build --prefix services/account-portal

# Expose port
EXPOSE 3002

# Start service using npm --prefix to use service package.json
CMD ["npm", "--prefix", "services/account-portal", "start"]
