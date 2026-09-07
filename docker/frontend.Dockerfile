FROM node:20-alpine AS base
RUN npm install -g pnpm@12.3.4

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY frontend/package.json ./frontend/

RUN pnpm install --filter @cms/frontend...

COPY frontend ./frontend

WORKDIR /app/frontend

EXPOSE 3000
CMD ["pnpm", "dev"]
