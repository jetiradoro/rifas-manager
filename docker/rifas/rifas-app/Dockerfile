# syntax=docker/dockerfile:1
# Contexto de build: raíz del repositorio (ver docker-compose.yml)

# ---------- base: sistema + usuario ----------
FROM node:lts AS base

ARG USER_ID=1000
ARG GROUP_ID=1000

RUN apt-get update \
  && apt-get install -y --no-install-recommends bash less vim \
  && rm -rf /var/lib/apt/lists/*

# Crear usuario con el UID/GID correcto si no existe
RUN if ! getent group ${GROUP_ID} > /dev/null; then groupadd -g ${GROUP_ID} appgroup; fi \
  && if ! id -u ${USER_ID} > /dev/null 2>&1; then useradd -u ${USER_ID} -g ${GROUP_ID} -m -s /bin/bash appuser; fi

WORKDIR /app

# ---------- dev: el código se monta por volumen ----------
FROM base AS dev
ARG USER_ID=1000
ARG GROUP_ID=1000
RUN chown -R ${USER_ID}:${GROUP_ID} /app
CMD ["bash", "/docker/init-container.sh"]

# ---------- build: instala dependencias y compila ----------
FROM base AS build
ARG USER_ID=1000
ARG GROUP_ID=1000

COPY --chown=${USER_ID}:${GROUP_ID} rifas-app/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --include=dev

COPY --chown=${USER_ID}:${GROUP_ID} rifas-app/ ./
RUN npm run build

# Inyecta runtime-config.js en el index si no está
RUN if ! grep -q "runtime-config.js" dist/pwa/index.html; then \
    sed -i 's#</head>#  <script src="/runtime-config.js"></script>\n</head>#' dist/pwa/index.html; \
  fi \
  && chown -R ${USER_ID}:${GROUP_ID} /app

# ---------- prod: solo lo necesario para servir ----------
FROM base AS prod
ARG USER_ID=1000
ARG GROUP_ID=1000
ENV NODE_ENV=production

COPY --from=build --chown=${USER_ID}:${GROUP_ID} /app/package*.json ./
COPY --from=build --chown=${USER_ID}:${GROUP_ID} /app/node_modules ./node_modules
COPY --from=build --chown=${USER_ID}:${GROUP_ID} /app/dist ./dist
COPY --chmod=755 docker/rifas/rifas-app/init-container.sh /docker/init-container.sh

USER ${USER_ID}:${GROUP_ID}
CMD ["bash", "/docker/init-container.sh"]
