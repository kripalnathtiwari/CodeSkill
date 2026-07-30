FROM node:20-slim AS builder

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install dependencies first for Docker caching
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
RUN npm install

# Copy application source
COPY . .

# Generate Prisma Client & build TypeScript to JavaScript
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install production dependencies only (--omit=dev replaces deprecated --only=production)
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev && npm cache clean --force
RUN npx prisma generate

# Copy compiled JavaScript from builder
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/src/app.js"]
