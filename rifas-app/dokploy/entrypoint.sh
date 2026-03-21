#!/usr/bin/env sh
set -e

cd /app

if [ "${NODE_ENV}" = "production" ]; then
  # Servir archivos estáticos en producción (necesitarás un servidor como serve)
  npx serve -s dist/pwa -l 3000
else
  npm run dev
fi
