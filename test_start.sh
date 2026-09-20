#!/bin/bash
npx prisma db push --schema=backend/prisma/schema.prisma --accept-data-loss
node backend/dist/app.js
