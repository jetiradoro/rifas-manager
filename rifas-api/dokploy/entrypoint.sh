#!/usr/bin/env sh
set -e

cd /app

# tail -f /dev/null & wait

export PRISMA_ENGINES_CACHE_DIR=/tmp/prisma
mkdir -p "$PRISMA_ENGINES_CACHE_DIR"

if [ "$NODE_ENV" = "production" ]; then
  npm run migrate:deploy
  exec npm run start:prod
else
  npm run migrate:dev
  npm run generate
  exec npm run start:dev
fi