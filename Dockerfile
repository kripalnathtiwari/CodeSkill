FROM node:20-slim AS builder

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY backend/tsconfig.json ./backend/
COPY backend/prisma ./backend/prisma
RUN npm install --include=dev

COPY . .
RUN npm run prisma:generate
RUN npm run build:backend

FROM node:20-slim

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma
RUN npm install && npm cache clean --force
RUN npm run prisma:generate

COPY --from=builder /usr/src/app/backend/dist ./backend/dist

ENV PATH="/usr/src/app/node_modules/.bin:/usr/src/app/backend/node_modules/.bin:${PATH}"
EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --schema=backend/prisma/schema.prisma --accept-data-loss && node backend/dist/app.js"]
