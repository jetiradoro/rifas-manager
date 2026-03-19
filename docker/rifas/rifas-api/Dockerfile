FROM node:lts

ARG USER_ID=1000
ARG GROUP_ID=1000

# Dependencias de sistema y herramientas globales en una sola capa
RUN apt-get update \
  && apt-get install -y --no-install-recommends bash less vim \
  && npm install -g @nestjs/cli prisma \
  && rm -rf /var/lib/apt/lists/*

# Crear usuario con el UID/GID correcto si no existe
RUN if ! getent group ${GROUP_ID} > /dev/null; then groupadd -g ${GROUP_ID} appgroup; fi \
  && if ! id -u ${USER_ID} > /dev/null 2>&1; then useradd -u ${USER_ID} -g ${GROUP_ID} -m -s /bin/bash appuser; fi

WORKDIR /app

# Asegurar permisos correctos en /app
RUN chown -R ${USER_ID}:${GROUP_ID} /app

# El código y dependencias se montan en runtime vía docker-compose
