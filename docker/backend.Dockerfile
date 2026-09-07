FROM node:20-alpine AS base
RUN npm install -g pnpm@12.3.4

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY backend/package.json ./backend/

RUN pnpm install --filter @cms/backend...

COPY backend ./backend

WORKDIR /app/backend
RUN pnpm prisma generate

EXPOSE 5000
CMD ["pnpm", "dev"]
