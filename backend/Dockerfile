FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies first for Docker caching
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# Copy application source
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled JavaScript from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Generate Prisma Client in production image
RUN npx prisma generate

EXPOSE 5000

CMD ["node", "dist/src/app.js"]
