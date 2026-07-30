FROM node:20-alpine AS builder

WORKDIR /usr/src/app

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
FROM node:20-alpine

WORKDIR /usr/src/app

# Install production dependencies only (--omit=dev replaces deprecated --only=production)
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev && npm cache clean --force

# Copy compiled JavaScript & Prisma client from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 5000

CMD ["node", "dist/src/app.js"]
