# Comandos de Desarrollo

## Docker

Desde `docker/rifas/`:

```bash
# Setup inicial
docker network create docker-net
cp .env.example .env  # Editar con tus valores

# Desarrollo
docker compose build
docker compose up -d
docker compose logs -f [rifas-api|rifas-app]
docker compose down

# Acceso a contenedor
docker compose exec rifas-api bash
docker compose exec rifas-app bash
```

## rifas-api

**IMPORTANTE**: Todas las instrucciones de terminal referentes a la API (npm, npx, prisma, etc.) deben ejecutarse dentro del contenedor Docker:

```bash
docker exec rifas-api [instrucción que sea]
```

**Ejemplos**:
```bash
# Desarrollo
docker exec rifas-api npm install
docker exec rifas-api npm run start:dev
docker exec rifas-api npm run start:debug

# Build
docker exec rifas-api npm run build
docker exec rifas-api npm run start:prod

# Lint & Format
docker exec rifas-api npm run lint
docker exec rifas-api npm run format

# Tests
docker exec rifas-api npm run test
docker exec rifas-api npm run test:watch
docker exec rifas-api npm run test:cov
docker exec rifas-api npm run test:e2e

# Prisma
docker exec rifas-api npx prisma generate
docker exec rifas-api npx prisma migrate dev --name descripcion
docker exec rifas-api npx prisma migrate deploy       # Producción
docker exec rifas-api npx prisma migrate status
docker exec rifas-api npx prisma studio
docker exec rifas-api npx prisma format
docker exec rifas-api npx prisma validate
```

## rifas-app

**IMPORTANTE**: Todas las ejecuciones npm del frontend deben ejecutarse a través de Docker:

```bash
docker exec rifas-app [instrucción que sea]
```

**Ejemplos**:
```bash
# Desarrollo
docker exec rifas-app npm install
docker exec rifas-app npm run dev
docker exec rifas-app quasar dev -m pwa
docker exec rifas-app quasar dev -p 8080

# Build
docker exec rifas-app npm run build
docker exec rifas-app quasar build
docker exec rifas-app quasar build --analyze

# Lint & Format
docker exec rifas-app npm run lint
docker exec rifas-app npm run format

# Quasar CLI
docker exec rifas-app quasar info
docker exec rifas-app quasar clean
docker exec rifas-app quasar new component NombreComponente
docker exec rifas-app quasar new page NombrePage
docker exec rifas-app quasar new store NombreStore
```

## Git

```bash
git status
git add .
git commit -m "feat(scope): descripción"
git push origin rama
git checkout -b feature/nueva-funcionalidad
```

## Troubleshooting

```bash
# Puerto en uso
sudo lsof -i :80
sudo kill -9 $(sudo lsof -t -i:80)

# Permisos
sudo chown -R 1000:1000 rifas-api/ rifas-app/
chmod +x docker/rifas/*/init-container.sh

# Regenerar Prisma
cd rifas-api && rm -rf node_modules/{@prisma,.prisma} && npx prisma generate

# Limpiar
npm cache clean --force
rm -rf node_modules dist && npm install
docker compose down -v && docker system prune -a
```
