# Frontend Dockerfile for Personal-CFO (Next.js 15, pnpm)

# 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Install deps first for better caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy app source
COPY . .

# Build Next.js
RUN pnpm build

# 2) Run stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Enable pnpm via Corepack in runtime image as well
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy built app from builder
COPY --from=builder /app .

EXPOSE 3000
CMD ["pnpm", "start"]
