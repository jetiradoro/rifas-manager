# CLAUDE.md

Archivo principal de referencia para Claude Code (claude.ai/code).

## Idioma

- Conversaciones y comentarios: **castellano**
- Código (variables, funciones, clases): **inglés**

## Stack

- **Backend**: NestJS 11 + Prisma 6.19 + MySQL
- **Frontend**: Quasar 2.16 (Vue 3.5) + Pinia 3
- **Docker**: Compose v2, red externa `docker-net`

## Reglas Críticas

### Documentación JSDoc (Obligatorio)

```typescript
/**
 * Descripción del método.
 * @param nombreParam Descripción
 * @returns Descripción
 */
```

### Estilo

- Indentación: 4 espacios
- Longitud: ≤100 caracteres
- ESLint + Prettier antes de commit
- Naming: `PascalCase` (clases), `camelCase` (métodos), `UPPER_SNAKE_CASE` (constantes)

### Commits (Conventional Commits)

```bash
feat(scope): descripción
fix(scope): descripción
chore(scope): descripción
```

### Seguridad

- Usar `class-validator` en DTOs
- Excepciones NestJS: `NotFoundException`, `ConflictException`, etc.
- Nunca commitear secretos

## Comandos Esenciales

```bash
# Docker (desde docker/rifas/)
docker compose build && docker compose up -d
docker network create docker-net  # Solo primera vez

# API (rifas-api/)
npm run start:dev                   # Desarrollo
npm run lint && npm run format      # Pre-commit
npx prisma migrate dev --name desc  # Nueva migración
npx prisma studio                   # Explorar BD

# App (rifas-app/)
npm run dev                         # Desarrollo
npm run lint && npm run format      # Pre-commit
```

## Arquitectura Backend

- **CORS**: Habilitado global
- **ValidationPipe**: Global con `whitelist: true`
- **ApiTokenGuard**: Valida Bearer token (global)
- **DateFormatInterceptor**: Formatea fechas con dayjs
- **RequestLoggerMiddleware**: Log de peticiones HTTP

## Arquitectura Frontend

- **Composition API**: `<script setup lang="ts">`
- **Pinia**: Stores en `modules/[feature]/stores/`
- **Axios**: Configurado en `boot/axios.ts` con Bearer token
- **PWA**: Service Workers con Workbox

## Variables de Entorno (docker/rifas/.env)

```bash
NODE_ENV=development
DATABASE_URL=mysql://user:pass@host:3306/db
API_TOKEN=token-secreto
API_VIRTUAL_HOST=api.rifas.local
APP_VIRTUAL_HOST=app.rifas.local
```

## Schema Prisma Actual

```prisma
model Rifa {
  id         Int      @id @default(autoincrement())
  name       String   @unique
  n_tickets  Int
  fecha      DateTime
  n_prizes   Int
  @@map("rifas")
}
```

## Flujo de Trabajo

1. **Backend**: Controller → Service (validación) → Prisma → BD
2. **Frontend**: Component → Pinia Store → Axios → Backend
3. **Migraciones**: Editar schema → `npx prisma migrate dev --name desc` → Commit

## Referencias Detalladas

Para información ampliada, consultar:
- [knowledge.md](knowledge.md) - Arquitectura completa
- [rules.md](rules.md) - Reglas exhaustivas
- [commands.md](commands.md) - Todos los comandos
- [database.md](database.md) - Prisma avanzado
- [behavior.md](behavior.md) - Patrones de código
