#!/usr/bin/env bash
set -euo pipefail

DOCS_UID="${DOCS_UID:-${MAP_UUID:-1000}}"
DOCS_GID="${DOCS_GID:-${MAP_UUID:-1000}}"
DOCS_GROUP_NAME="hostdocs"
GRAV_USER_DIR="/var/www/html/user"
GRAV_THEMES_DIR="/var/www/html/user/themes"

mkdir -p "${GRAV_USER_DIR}" "${GRAV_THEMES_DIR}"

if ! getent group "${DOCS_GID}" >/dev/null 2>&1; then
    groupadd -g "${DOCS_GID}" "${DOCS_GROUP_NAME}" >/dev/null 2>&1 || true
fi

DOCS_GROUP_NAME="$(getent group "${DOCS_GID}" | cut -d: -f1 || echo "${DOCS_GROUP_NAME}")"
usermod -a -G "${DOCS_GROUP_NAME}" www-data >/dev/null 2>&1 || true

chown -R "${DOCS_UID}:${DOCS_GID}" "${GRAV_USER_DIR}" "${GRAV_THEMES_DIR}" || true
chmod -R u+rwX,g+rwX "${GRAV_USER_DIR}" "${GRAV_THEMES_DIR}" || true
find "${GRAV_USER_DIR}" "${GRAV_THEMES_DIR}" -type d -exec chmod g+s {} \; || true