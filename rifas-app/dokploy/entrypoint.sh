#!/usr/bin/env sh
set -e

cd /app

if [ "${NODE_ENV}" = "production" ]; then
  cat > /app/dist/pwa/runtime-config.js <<EOF
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
  VITE_JWT_TOKEN: "${VITE_JWT_TOKEN:-}"
};
EOF

  if ! grep -q "runtime-config.js" /app/dist/pwa/index.html; then
    sed -i 's#</head>#  <script src="/runtime-config.js"></script>\n</head>#' /app/dist/pwa/index.html
  fi

  npm run start:prod
else
  npm run dev
fi
