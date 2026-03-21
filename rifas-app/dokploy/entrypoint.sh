#!/usr/bin/env sh
set -e

cd /app

if [ "${NODE_ENV}" = "production" ]; then
  npm run build
  # Servir archivos estáticos en producción (necesitarás un servidor como serve)
  npx serve -s dist/pwa -l 80
else
  npm run dev
fi
