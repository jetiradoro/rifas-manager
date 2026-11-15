# syntax=docker/dockerfile:1
# Contexto de build: raíz del repositorio (ver docker-compose.yml)

# ---------- base: sistema + usuario ----------
FROM node:lts AS base

ARG USER_ID=1000
ARG GROUP_ID=1000

RUN apt-get update \
  && apt-get install -y --no-install-recommends bash less vim openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Crear usuario con el UID/GID correcto si no existe
RUN if ! getent group ${GROUP_ID} > /dev/null; then groupadd -g ${GROUP_ID} appgroup; fi \
  && if ! id -u ${USER_ID} > /dev/null 2>&1; then useradd -u ${USER_ID} -g ${GROUP_ID} -m -s /bin/bash appuser; fi

WORKDIR /app

# ---------- dev: el código se monta por volumen ----------
FROM base AS dev
ARG USER_ID=1000
ARG GROUP_ID=1000
RUN npm install -g @nestjs/cli prisma \
  && chown -R ${USER_ID}:${GROUP_ID} /app
CMD ["bash", "/docker/init-container.sh"]

# ---------- build: dependencias, cliente Prisma y compilación ----------
FROM base AS build
ARG USER_ID=1000
ARG GROUP_ID=1000

COPY --chown=${USER_ID}:${GROUP_ID} rifas-api/package*.json ./
COPY --chown=${USER_ID}:${GROUP_ID} rifas-api/prisma ./prisma
RUN --mount=type=cache,target=/root/.npm npm ci --include=dev

COPY --chown=${USER_ID}:${GROUP_ID} rifas-api/ ./
RUN npm run generate && npm run build \
  && chown -R ${USER_ID}:${GROUP_ID} /app

# ---------- prod: se conserva node_modules completo (ts-node para el seed) ----------
FROM base AS prod
ARG USER_ID=1000
ARG GROUP_ID=1000
ENV NODE_ENV=production

COPY --from=build --chown=${USER_ID}:${GROUP_ID} /app ./
COPY --chmod=755 docker/rifas/rifas-api/init-container.sh /docker/init-container.sh

USER ${USER_ID}:${GROUP_ID}
CMD ["bash", "/docker/init-container.sh"]
