FROM node:22.14.0

ENV NODE_OPTIONS=--dns-result-order=ipv4first

ARG USER_ID=1000
ARG GROUP_ID=1000

# Paquetes mínimos necesarios
RUN apt-get update \
  && apt-get install -y --no-install-recommends bash openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Crear grupo/usuario si no existen
RUN if ! getent group ${GROUP_ID} > /dev/null; then groupadd -g ${GROUP_ID} appgroup; fi \
  && if ! id -u ${USER_ID} > /dev/null 2>&1; then useradd -u ${USER_ID} -g ${GROUP_ID} -m -s /bin/bash appuser; fi

# Copiamos package files primero para aprovechar caché
COPY --chown=1000:1000 package*.json ./
COPY --chown=1000:1000 prisma ./prisma


# Instalar dependencias
RUN npm ci


# Copiar el resto del proyecto
COPY --chown=1000:1000 . .

RUN npm run generate
RUN npm run build

RUN chmod +x /app/dokploy/entrypoint.sh


USER ${USER_ID}:${GROUP_ID}

EXPOSE 3000

ENTRYPOINT ["/app/dokploy/entrypoint.sh"]