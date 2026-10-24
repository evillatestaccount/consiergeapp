#!/bin/sh
set -e

echo "✨ [Aura Docker Entrypoint] Starting initialization..."

# Extract host and port from DATABASE_URL if available
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}

echo "⏳ Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT} to be ready..."

MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null || pg_isready -h "$DB_HOST" -p "$DB_PORT" 2>/dev/null; then
    echo "📡 PostgreSQL is up and accepting connections!"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "⏳ Waiting for PostgreSQL ($RETRY_COUNT/$MAX_RETRIES)..."
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "⚠️ Warning: PostgreSQL wait timed out. Proceeding with startup..."
fi

# Push database schema to PostgreSQL
echo "🔄 Synchronizing PostgreSQL tables with Prisma schema..."
bun x prisma db push --accept-data-loss || true

# Seed database with SuperAdmin, Editors, Cities, Listings, and Inquiries
echo "🌱 Seeding PostgreSQL database..."
bun run scripts/seed.ts || true

echo "🚀 Starting Aura Social Directory on http://0.0.0.0:3000..."
exec bun run start
