# Frontend Dockerfile - React
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables
ENV CHOKIDAR_USEPOLLING=true

# Start development server
CMD ["npm", "start"]
