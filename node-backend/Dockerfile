# Step 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for node-gyp (for bcrypt etc.)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies)
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript code
RUN npm run build

# Step 2: Production Stage (Distroless/Alpine)
FROM node:20-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Expose port (can be overridden by environment)
EXPOSE 8080

# Run the app (using the built js file)
CMD ["node", "dist/api/main.js"]
