#!/usr/bin/env bash
set -euo pipefail

GRAV_ROOT="/var/www/html"
GRAV_USER_DIR="${GRAV_ROOT}/user"
GRAV_THEMES_DIR="${GRAV_USER_DIR}/themes"

mkdir -p "${GRAV_USER_DIR}" "${GRAV_THEMES_DIR}"

chown -R www-data:www-data "${GRAV_USER_DIR}" || true

exec docker-entrypoint.sh apache2-foreground
