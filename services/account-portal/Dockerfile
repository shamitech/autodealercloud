FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY src ./src
COPY tsconfig.json ./

# Expose port
EXPOSE 3002

# Start service
CMD ["npm", "start"]
