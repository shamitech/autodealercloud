FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY services/core-cms/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/core-cms/src ./src
COPY tsconfig.json ./
COPY services/core-cms/tsconfig.json ./tsconfig.json

# Expose port
EXPOSE 3001

# Start service
CMD ["npm", "run", "start:core-cms"]
