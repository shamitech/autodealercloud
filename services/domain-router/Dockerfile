FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY services/domain-router/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/domain-router/src ./src
COPY tsconfig.json ./
COPY services/domain-router/tsconfig.json ./tsconfig.json

# Expose port
EXPOSE 80

# Start service
CMD ["npm", "run", "start:domain-router"]
