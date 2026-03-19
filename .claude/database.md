# Base de Datos y Prisma

## Schema Actual

`rifas-api/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Rifa {
  id         Int      @id @default(autoincrement())
  name       String   @unique
  n_tickets  Int
  fecha      DateTime
  n_prizes   Int
  @@map("rifas")
}
```

## Convenciones

- **Modelos**: `PascalCase` singular (`Rifa`, `User`)
- **Tablas**: `snake_case` plural (`@@map("rifas")`)
- **Campos**: `snake_case` (`n_tickets`)
- **IDs**: `id Int @id @default(autoincrement())`

## Flujo de Migraciones

```bash
# 1. Editar schema.prisma
# 2. Crear migración
npx prisma migrate dev --name descripcion_cambio

# 3. Revisar SQL en prisma/migrations/XXXXX_descripcion_cambio/
# 4. Commit
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): descripción cambio"

# 5. Producción
npx prisma migrate deploy
```

## Tipos de Datos Comunes

| Prisma   | MySQL         | Ejemplo                             |
|----------|---------------|-------------------------------------|
| String   | VARCHAR(191)  | `name String`                       |
| Int      | INT           | `count Int`                         |
| Float    | DOUBLE        | `price Float`                       |
| Decimal  | DECIMAL(p,s)  | `price Decimal @db.Decimal(10,2)`   |
| Boolean  | TINYINT(1)    | `active Boolean @default(true)`     |
| DateTime | DATETIME(3)   | `createdAt DateTime @default(now())` |
| Json     | JSON          | `metadata Json`                     |

## Relaciones

### One-to-Many

```prisma
model Rifa {
  id       Int      @id @default(autoincrement())
  tickets  Ticket[]
  @@map("rifas")
}

model Ticket {
  id     Int  @id @default(autoincrement())
  rifaId Int
  rifa   Rifa @relation(fields: [rifaId], references: [id])
  @@map("tickets")
}
```

### Many-to-Many

```prisma
model Rifa {
  id     Int     @id @default(autoincrement())
  prizes Prize[]
  @@map("rifas")
}

model Prize {
  id    Int    @id @default(autoincrement())
  rifas Rifa[]
  @@map("prizes")
}
```

## Uso en Servicios

```typescript
@Injectable()
export class RifasService {
  constructor(private readonly prisma: PrismaService) {}

  // CRUD
  findAll() {
    return this.prisma.rifa.findMany();
  }

  findOne(id: number) {
    return this.prisma.rifa.findUnique({ where: { id } });
  }

  create(data: CreateRifaDto) {
    return this.prisma.rifa.create({
      data: {
        name: data.name,
        n_tickets: data.n_tickets,
        fecha: new Date(data.fecha),
        n_prizes: data.n_prizes,
      },
    });
  }

  update(id: number, data: UpdateRifaDto) {
    return this.prisma.rifa.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.rifa.delete({ where: { id } });
  }
}
```

## Queries Avanzados

```typescript
// Filtros
prisma.rifa.findMany({ where: { n_prizes: { gt: 1 } } });

// Ordenar
prisma.rifa.findMany({ orderBy: { fecha: 'desc' } });

// Paginación
prisma.rifa.findMany({ skip: 10, take: 10 });

// Contar
prisma.rifa.count();

// Relaciones
prisma.rifa.findMany({ include: { tickets: true } });

// Selección parcial
prisma.rifa.findMany({ select: { id: true, name: true } });
```

## Transacciones

```typescript
await prisma.$transaction([
  prisma.rifa.create({ data: {...} }),
  prisma.ticket.createMany({ data: [...] }),
]);

// O con callback
await prisma.$transaction(async (tx) => {
  const rifa = await tx.rifa.create({ data: {...} });
  await tx.ticket.create({ data: { rifaId: rifa.id, ...} });
  return rifa;
});
```

## Seeding

`prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.rifa.createMany({
    data: [
      { name: 'Rifa 1', n_tickets: 100, fecha: new Date(), n_prizes: 3 },
      // ...
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

`package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Ejecutar: `npx prisma db seed`

## Troubleshooting

```bash
# Error conexión BD
# → Verificar DATABASE_URL

# Cliente no regenerado
npx prisma generate

# Migraciones desincronizadas
npx prisma migrate status
npx prisma migrate resolve --applied "nombre_migracion"

# Reset completo (¡CUIDADO! Borra datos)
npx prisma migrate reset
```
