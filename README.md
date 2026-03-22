# Rifas Manager

Monorepo para gestión de rifas con tres servicios dockerizados:

- `rifas-api`: backend en NestJS + Prisma + MySQL.
- `rifas-app`: frontend en Quasar (Vue 3 + PWA).
- `rifas-docs`: documentación con Grav CMS, servida por Apache dentro del contenedor. (EN DESARROLLO)

El stack se orquesta desde `docker/rifas` con Docker Compose y red externa `docker-net`.

## Acceso a entorno DEMO

- **url**: https://rifas-manager.jetiradoro.com
- **email**: demo@rifas-manager.com
- **password**: rifasDemo#2026
 
## Opciones de instalación

Este proyecto se puede levantar de dos formas:

1. **Con Docker (recomendada)**: entorno homogéneo y rápido para todo el equipo.
2. **Sin Docker (host local)**: ejecutando API, App y Docs directamente en tu máquina.

## Quick Start

### Opción rápida con Docker (recomendada)

```bash
cd docker/rifas
cp .env.example .env
docker network create docker-net || true
docker compose up -d --build
docker compose logs -f
```

### Opción rápida sin Docker (host)

En tres terminales distintas:

```bash
# Terminal 1 (API)
cd rifas-api && cp .env.example .env && npm install && npm run migrate:dev && npm run start:dev

# Terminal 2 (App)
cd rifas-app && cp .env.example .env && npm install && npm run dev

# Terminal 3 (Docs con Grav)
PROJECT_ROOT="$(pwd)" && mkdir -p ~/grav-local && cd ~/grav-local && curl -L -o grav-admin.zip https://getgrav.org/download/core/grav-admin/latest && unzip grav-admin.zip && cp -a grav-admin/. . && cp -a "${PROJECT_ROOT}/docs/user" ./user && cp -a "${PROJECT_ROOT}/docs/themes" ./user/themes && php -S 0.0.0.0:8000 -t .
```

## Stack tecnológico

- Node.js 22 (contenedores de API y app).
- NestJS 11 + Prisma 6 (backend).
- Quasar 2 + Vue 3 + Pinia (frontend).
- Grav CMS 1.7 + Apache (documentación).
- Docker + Docker Compose v2.

## Estructura del repositorio

- `rifas-api/`: código fuente de la API.
- `rifas-app/`: código fuente de la aplicación web.
- `docs/`: contenido editable de Grav (`user` y `themes`).
- `docker/rifas/`: `docker-compose.yml`, Dockerfiles y scripts de arranque de servicios.

## Instalación opción A: con Docker (recomendada)

### Requisitos

1. Docker y Docker Compose v2 instalados.
2. Red Docker externa creada (solo primera vez):

```bash
docker network create docker-net
```

3. Configurar variables de entorno compartidas:

```bash
cd docker/rifas
cp .env.example .env
```

### Variables de entorno principales (docker/rifas/.env)

Definidas en `docker/rifas/.env`:

- `NODE_ENV`: `development` o `production`.
- `MAP_UUID`: UID/GID del usuario local (por defecto `1000`).
- `API_VIRTUAL_HOST`: dominio de la API para proxy externo.
- `APP_VIRTUAL_HOST`: dominio de la app para proxy externo.
- `DOCS_VIRTUAL_HOST`: dominio de la documentación (Grav).

### Arranque del stack

Desde `docker/rifas`:

```bash
docker compose build
docker compose up -d
docker compose logs -f
```

Servicios levantados:

- `rifas-api` (mapea `rifas-api/` en `/app`).
- `rifas-app` (mapea `rifas-app/` en `/app`).
- `rifas-docs` (mapea `docs/user` y `docs/themes` en Grav).

## Instalación opción B: sin Docker (host local)

### Requisitos

1. Node.js 22 + npm.
2. MySQL disponible para la API.
3. PHP 8.2+ con extensiones habituales (`curl`, `mbstring`, `zip`, `gd`, `xml`).
4. `unzip` y `curl` instalados (para Grav).

### 1) API en host

```bash
cd rifas-api
cp .env.example .env
npm install
npm run migrate:dev
npm run generate
npm run start:dev
```

### 2) App en host

```bash
cd rifas-app
cp .env.example .env
npm install
npm run dev
```

### 3) Docs (Grav) en host

El repositorio contiene el contenido editable en `docs/user` y `docs/themes`, pero no una
instalación completa de Grav. Para levantarlo en host sin Docker:

```bash
PROJECT_ROOT="$(pwd)"
mkdir -p ~/grav-local && cd ~/grav-local
curl -L -o grav-admin.zip https://getgrav.org/download/core/grav-admin/latest
unzip grav-admin.zip
cp -a grav-admin/. .
cp -a "${PROJECT_ROOT}/docs/user" ./user
cp -a "${PROJECT_ROOT}/docs/themes" ./user/themes
php -S 0.0.0.0:8000 -t .
```

Luego abre `http://localhost:8000`.

## Variables de entorno recomendadas (host)

- API (`rifas-api/.env`):
  - `NODE_ENV=development`
  - `DATABASE_URL=...`
  - `API_TOKEN=...`
- App (`rifas-app/.env`):
  - `VITE_API_BASE_URL=http://localhost:<puerto-api>`

## Flujo de ejecución por entorno

### API (`rifas-api`)

- **development**: instala dependencias, ejecuta migraciones dev, genera Prisma Client y arranca
  con `npm run start:dev`.
- **production**: instala dependencias, aplica `migrate deploy`, genera Prisma Client, compila y
  arranca con `npm run start:prod`.

### App (`rifas-app`)

- **development**: instala dependencias y arranca `npm run dev`.
- **production**: instala dependencias, build PWA y sirve estáticos.

### Docs (`rifas-docs`)

- Arranca sobre la imagen `getgrav/grav`.
- Si Grav no existe en `/var/www/html`, se instala automáticamente al iniciar el contenedor.
- Expone contenido por Apache (`apache2-foreground`).

## Edición de documentación (Grav)

El servicio `rifas-docs` monta estas carpetas del host:

- `docs/user` → `/var/www/html/user`
- `docs/themes` → `/var/www/html/user/themes`

Esto permite editar páginas, configuración y temas directamente desde el IDE.

## Permisos de escritura en Linux

Para evitar problemas de permisos en carpetas mapeadas:

- Usa `MAP_UUID` con el UID/GID de tu usuario local.
- El contenedor `rifas-docs` ajusta ownership y permisos de `docs/user` y `docs/themes` durante
  el arranque para permitir edición desde host e IDE.

Si cambias de usuario o máquina, actualiza `MAP_UUID` en `.env` y recrea el servicio:

```bash
cd docker/rifas
docker compose up -d --build rifas-docs
```

## Comandos útiles

Desde la raíz de cada proyecto:

- API:
  - `npm run lint`
  - `npm run test`
  - `npm run migrate:dev`
  - `npm run migrate:deploy`
- App:
  - `npm run lint`
  - `npm run format`
  - `npm run build`

## Solución de problemas rápida

- Ver estado de servicios:

```bash
cd docker/rifas
docker compose ps
```

- Ver logs de un servicio:

```bash
docker compose logs -f rifas-api
docker compose logs -f rifas-app
docker compose logs -f rifas-docs
```

- Recrear solo documentación:

```bash
docker compose up -d --build rifas-docs
```

- Reinstalar dependencias locales sin Docker:

```bash
cd rifas-api && rm -rf node_modules package-lock.json && npm install
cd ../rifas-app && rm -rf node_modules package-lock.json && npm install
```

## Buenas prácticas del repositorio

- Mantener ESLint/Prettier limpios antes de integrar cambios.
- Seguir Conventional Commits (`feat:`, `fix:`, `chore:`).
- Actualizar `README.md` y `.env.example` cuando se añadan servicios o variables nuevas.
