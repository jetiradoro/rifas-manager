#!/usr/bin/env bash
set -e

cd /app

if [ "${NODE_ENV}" = "production" ]; then
  npm install --include=dev
  npm run build
  # Servir archivos estáticos en producción (necesitarás un servidor como serve)
  npx serve -s dist/pwa -l 80
else
  npm install --include=dev
  npm run dev
fi
