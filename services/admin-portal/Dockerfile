FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY services/admin-portal/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/admin-portal/src ./src
COPY tsconfig.json ./
COPY services/admin-portal/tsconfig.json ./tsconfig.json

# Expose port
EXPOSE 3003

# Start service
CMD ["npm", "run", "start:admin-portal"]
