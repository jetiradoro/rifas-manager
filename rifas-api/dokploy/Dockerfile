FROM node:20-bookworm-slim

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
# COPY package*.json ./
# COPY prisma ./prisma

# Instalar dependencias
RUN npm install



# Copiar el resto del proyecto
COPY . .

RUN npx prisma generate
RUN npm run build

RUN chmod +x /app/dokploy/entrypoint.sh
RUN chown -R ${USER_ID}:${GROUP_ID} /app

USER ${USER_ID}:${GROUP_ID}

EXPOSE 3000

ENTRYPOINT ["/app/dokploy/entrypoint.sh"]