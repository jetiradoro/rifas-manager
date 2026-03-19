# Arquitectura del Proyecto

## Stack Tecnológico

### Backend (rifas-api)
- NestJS 11 + TypeScript 5.7
- Prisma 6.19 (ORM para MySQL)
- class-validator + class-transformer
- dayjs (fechas)

### Frontend (rifas-app)
- Quasar 2.16 + Vue 3.5 + TypeScript 5.9
- Pinia 3 (estado)
- Axios 1.7 (HTTP)
- Workbox (PWA/Service Workers)

### Infraestructura
- Docker Compose v2
- MySQL (externa o dockerizada)
- Proxy inverso nginx (maneja VIRTUAL_HOST)

## Estructura de Directorios

```
rifas-v2/
├── rifas-api/
│   ├── src/
│   │   ├── rifas/              # CRUD rifas
│   │   │   ├── dto/
│   │   │   ├── rifas.{controller,service,module}.ts
│   │   ├── prisma/             # PrismaService
│   │   ├── guards/             # ApiTokenGuard
│   │   ├── middleware/         # RequestLoggerMiddleware
│   │   ├── common/interceptors/  # DateFormatInterceptor
│   │   └── main.ts
│   └── prisma/schema.prisma
│
├── rifas-app/
│   └── src/
│       ├── modules/rifas/      # Componentes + stores
│       ├── boot/axios.ts       # Config HTTP
│       └── router/
│
└── docker/rifas/
    ├── docker-compose.yml
    ├── .env
    └── {rifas-api,rifas-app}/
        ├── Dockerfile
        └── init-container.sh
```

## Flujo de Arquitectura

### Backend
1. `main.ts`: Bootstrap con CORS, ValidationPipe, DateFormatInterceptor
2. `AppModule`: Registra ApiTokenGuard global, RequestLoggerMiddleware
3. Módulos feature: Controller → Service → Prisma

### Frontend
1. `main.ts` → `App.vue`
2. `boot/axios.ts`: Configura cliente HTTP con Bearer token
3. Router → Pages → Components → Pinia Stores

## Modelo de Datos

```typescript
interface Rifa {
  id: number          // Auto-incremental
  name: string        // Único
  n_tickets: number
  fecha: Date
  n_prizes: number
}
```

## Docker Compose

### Características
- Usuario `1000:1000` (evita problemas permisos)
- Volúmenes montados para hot reload
- Red `docker-net` (externa)
- Scripts `init-container.sh` según `NODE_ENV`
- Puertos: 80 (dev), 443 (prod) - no expuestos, via proxy
