#!/usr/bin/env bash
set -e

cd /app

if [ "${NODE_ENV}" = "production" ]; then
  # Producción: la imagen ya trae dist/ compilado; solo se inyecta la configuración
  cat > /app/dist/pwa/runtime-config.js <<CFG
window.__RIFAS_RUNTIME_CONFIG__ = {
  VITE_API_BASE: "${VITE_API_BASE:-}",
  VITE_API_TOKEN: "${VITE_API_TOKEN:-}",
  VITE_APP_NAME: "${VITE_APP_NAME:-}",
  VITE_APP_VERSION: "${VITE_APP_VERSION:-}",
  VITE_PACKAGE_NAME: "${VITE_PACKAGE_NAME:-}",
  VITE_PACKAGE_VERSION: "${VITE_PACKAGE_VERSION:-}",
  VITE_CONTACT_EMAIL: "${VITE_CONTACT_EMAIL:-}",
  VITE_CONTACT_ADDRESS: "${VITE_CONTACT_ADDRESS:-}",
  VITE_CONTACT_PHONE: "${VITE_CONTACT_PHONE:-}",
  VITE_JWT_TOKEN: "${VITE_JWT_TOKEN:-}",
  VITE_DEMO_ENV: "${VITE_DEMO_ENV:-}"
};
CFG
  exec npx serve -s dist/pwa -l 80
else
  npm install --include=dev
  exec npm run dev
fi
