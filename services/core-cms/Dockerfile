FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/core-cms/src ./src
COPY tsconfig.json ./
COPY services/core-cms/tsconfig.json ./tsconfig-service.json

# Expose port
EXPOSE 3001

# Start service from root, cd into service dir and run
CMD ["sh", "-c", "cd services/core-cms && npm start"]
