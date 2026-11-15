#!/usr/bin/env bash
set -e

cd /app

PRISMA_ENGINES_CACHE_DIR=/tmp/prisma
export PRISMA_ENGINES_CACHE_DIR
mkdir -p "${PRISMA_ENGINES_CACHE_DIR}"

if [ "${NODE_ENV}" = "production" ]; then
  # Producción: la imagen ya trae node_modules, cliente Prisma y dist/ compilados
  npx prisma migrate deploy
  # Crea el admin inicial si no existe (idempotente)
  npx ts-node prisma/seed-admin.ts
  exec npm run start:prod
else
  npm install --include=dev
  # En desarrollo, crea/aplica migraciones si hay cambios en el schema
  npx prisma migrate dev
  npx prisma generate
  npx ts-node prisma/seed-admin.ts
  exec npm run start:dev
fi
