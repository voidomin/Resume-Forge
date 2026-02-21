# Stage 1: Build
FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend ./backend
COPY shared ./shared
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-bullseye-slim
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --only=production
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
# Need prisma client in prod too
RUN npx prisma generate

EXPOSE 3000
CMD ["node", "dist/backend/src/index.js"]
