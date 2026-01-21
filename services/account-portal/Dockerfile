FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY services/account-portal/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY services/account-portal/src ./src
COPY tsconfig.json ./
COPY services/account-portal/tsconfig.json ./tsconfig.json

# Expose port
EXPOSE 3002

# Start service
CMD ["npm", "run", "start:account-portal"]
