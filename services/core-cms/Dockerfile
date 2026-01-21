FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/core-cms/src ./services/core-cms/src
COPY services/core-cms/package.json ./services/core-cms/
COPY tsconfig.json ./
COPY services/core-cms/tsconfig.json ./services/core-cms/

# Build the TypeScript for this service
RUN npm run build --prefix services/core-cms

# Expose port
EXPOSE 3001

# Start service using npm --prefix to use service package.json
CMD ["npm", "--prefix", "services/core-cms", "start"]
