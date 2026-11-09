#!/usr/bin/env bash
set -e

cd /app

PRISMA_ENGINES_CACHE_DIR=/tmp/prisma
export PRISMA_ENGINES_CACHE_DIR
mkdir -p "${PRISMA_ENGINES_CACHE_DIR}"
# Verifica el entorno de ejecución y aplica las migraciones correspondientes
#
if [ "${NODE_ENV}" = "production" ]; then
  npm install --include=dev
  # Aplica migraciones ya creadas al entorno objetivo
  npx prisma migrate deploy
  npx prisma generate
  # Crea el admin inicial si no existe (idempotente)
  npx ts-node prisma/seed-admin.ts
  npm run build
  npm run start:prod
else
  npm install --include=dev
  # En desarrollo, crea/aplica migraciones si hay cambios en el schema
  npx prisma migrate dev
  # Genera el cliente de Prisma con los permisos del usuario 1000 dentro del contenedor
  npx prisma generate
  # Crea el admin inicial si no existe (idempotente)
  npx ts-node prisma/seed-admin.ts
  npm run start:dev
fi

