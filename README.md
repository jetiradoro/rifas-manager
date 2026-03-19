# Rifas Manager

Monorepo con dos servicios dockerizados para gestionar el backend y frontend de la aplicación
de rifas. El stack se orquesta desde `docker/rifas` y usa volúmenes para desarrollo con hot
reload.

## Estructura
- `rifas-api`: API en NestJS + Prisma (carpeta montada en `/app` del contenedor).
- `rifas-app`: SPA en Quasar/Vue 3 (carpeta montada en `/app` del contenedor).
- `docker/rifas`: `docker-compose.yml`, Dockerfiles y scripts `init-container.sh`.

## Requisitos
- Docker y Docker Compose v2.
- Variables de entorno definidas en `docker/rifas/.env` (copiar desde `.env.example`).

## Variables de entorno
`docker/rifas/.env` se comparte entre los servicios. Clona `docker/rifas/.env.example` y ajusta:
- `NODE_ENV`: `development` o `production`.
- `API_VIRTUAL_HOST` y `APP_VIRTUAL_HOST`: hostnames que expondrá el proxy inverso externo.
- `DATABASE_URL`: credenciales y host del MySQL accesible para Prisma.

## Puesta en marcha en desarrollo
Ejecuta siempre desde `docker/rifas`:
```bash
docker compose build          # construye imágenes del backend y frontend
docker compose up -d          # levanta los contenedores en segundo plano
docker compose logs -f        # sigue los logs si necesitas depurar
```
Los contenedores inician como usuario 1000:1000 y montan el código local, por lo que los
cambios en `rifas-api` o `rifas-app` se reflejan en caliente.

- Backend: arranca con `npm run start:dev` (puerto interno 80).
- Frontend: arranca con `quasar dev -m pwa -p 80` y depende de `rifas-api`.
- En producción, los scripts `init-container.sh` ejecutan `npm ci`, build y procesos en puerto
  443.

## Comandos útiles por servicio
Dentro del contenedor o con tu entorno local:
- API: `npm run lint`, `npm run test`, `npx prisma migrate dev` (dev) o `migrate deploy` (prod).
- App: `npm run lint`, `npm run format`, `quasar build` para empaquetar.

## Notas de despliegue
- No se exponen puertos en los Dockerfile; el proxy inverso externo enruta a 80/443 según
  `VIRTUAL_HOST`.
- Si agregas servicios o variables nuevas, documenta los cambios en un `.env.example`
  equivalente y actualiza este README.
