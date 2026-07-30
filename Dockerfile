FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY backend/tsconfig.json ./backend/
RUN npm ci

COPY . .
RUN npm run prisma:generate
RUN npm run build:backend

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/backend/dist ./backend/dist
COPY --from=builder /usr/src/app/backend/prisma ./backend/prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 5000

CMD ["node", "backend/dist/src/app.js"]
