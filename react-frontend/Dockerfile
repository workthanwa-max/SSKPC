FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build the frontend application
RUN npm run build

# Start the Vite production preview server
CMD ["sh", "-c", "npm run start"]
