# =========================================================
# Production Dockerfile for Aura Social Directory (Next.js + Bun)
# =========================================================

FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Install system dependencies needed by Prisma engine & wait scripts
RUN apk add --no-cache openssl libc6-compat netcat-openbsd postgresql-client

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy package manifests
COPY package.json ./

# Install dependencies with Bun
RUN bun install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN bun x prisma generate

# Copy source code and configuration files
COPY next.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY tsconfig.json ./
COPY src ./src/
COPY scripts ./scripts/
COPY public ./public/
COPY docker-entrypoint.sh ./

# Make entrypoint executable
RUN chmod +x docker-entrypoint.sh

# Build the Next.js application (SSG routes will compile with seed fallback)
RUN bun run build

# Expose Next.js default port
EXPOSE 3000

# Run entrypoint script which waits for Postgres, syncs Prisma schema, seeds data, and starts Next.js
ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
