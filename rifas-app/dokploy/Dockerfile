FROM node:22.14.0

ENV NODE_OPTIONS=--dns-result-order=ipv4first

ARG USER_ID=1000
ARG GROUP_ID=1000

# Dependencias de sistema y herramientas globales en una sola capa
RUN apt-get update \
  && apt-get install -y --no-install-recommends bash less vim \
  && rm -rf /var/lib/apt/lists/*

# Crear usuario con el UID/GID correcto si no existe
RUN if ! getent group ${GROUP_ID} > /dev/null; then groupadd -g ${GROUP_ID} appgroup; fi \
  && if ! id -u ${USER_ID} > /dev/null 2>&1; then useradd -u ${USER_ID} -g ${GROUP_ID} -m -s /bin/bash appuser; fi


WORKDIR /app

# Copiamos package files primero para aprovechar caché
COPY --chown=1000:1000 package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del proyecto
COPY --chown=1000:1000 . .
RUN npm run build

RUN if ! grep -q "runtime-config.js" /app/dist/pwa/index.html; then \
    sed -i 's#</head>#  <script src="/runtime-config.js"></script>\n</head>#' \
      /app/dist/pwa/index.html; \
  fi

RUN chown -R ${USER_ID}:${GROUP_ID} /app/dist

RUN chmod +x /app/dokploy/entrypoint.sh


USER ${USER_ID}:${GROUP_ID}

ENTRYPOINT ["/app/dokploy/entrypoint.sh"]
