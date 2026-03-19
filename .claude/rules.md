# Reglas y Convenciones

## Principios SOLID

- Métodos de propósito único
- Sin efectos colaterales
- Dependencias inyectadas

## Documentación JSDoc (Obligatorio)

```typescript
/**
 * Descripción del método.
 * @param param Descripción del parámetro
 * @returns Descripción del retorno
 * @throws TipoExcepcion Cuándo se lanza
 */
```

## Estilo

- Indentación: 4 espacios
- Línea: ≤100 caracteres
- Naming:
  - Clases/Interfaces: `PascalCase`
  - Métodos/Variables: `camelCase`
  - Constantes: `UPPER_SNAKE_CASE`
  - Archivos: `kebab-case.ts`

## Validación (Backend)

- DTOs con `class-validator`:
  - `@IsString()`, `@IsInt()`, `@IsDateString()`, `@Min()`, `@IsOptional()`
- Excepciones NestJS:
  - `NotFoundException`, `ConflictException`, `BadRequestException`
  - `UnauthorizedException`, `ForbiddenException`

## Tests

- Ubicación: `*.spec.ts` (unitarios), `test/` (E2E)
- Naming: `should_[acción]_when_[condición]`
- Ejemplos:
  - `should_create_raffle_with_unique_code`
  - `should_throw_conflict_when_name_exists`

## Conventional Commits

```
tipo(alcance): descripción
```

**Tipos**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

**Ejemplos**:
```bash
feat(rifas): añadir endpoint sorteo
fix(api): corregir validación fecha
chore(deps): actualizar prisma
```

## Estructura Módulos

### Responsabilidad de Funcionalidades

**Regla Principal**: Mantén siempre la responsabilidad de las funcionalidades. Distribuye correctamente los archivos de forma que cada uno exista dentro del módulo al que corresponde, tanto en la API como en la app. Cada módulo es autónomo y contiene toda su lógica relacionada.

### Backend (NestJS)
```
[feature]/
├── dto/
│   ├── create-[feature].dto.ts
│   └── update-[feature].dto.ts
├── [feature].controller.ts
├── [feature].service.ts
├── [feature].module.ts
└── [feature].controller.spec.ts
```

### Frontend (Quasar)
```
modules/[feature]/
├── components/
├── pages/
├── layouts/
└── stores/
```

## Estilos SCSS (Frontend)

Los estilos visuales deben estar organizados según el siguiente esquema:

1. **Ubicación centralizada**: Los estilos deben estar en archivos `.scss` de forma centralizada y distribuida por tipo de visualización, ubicados en `rifas-app/src/css/`.

2. **Estructura**: Cada módulo o tipo de visualización tiene su archivo SCSS correspondiente:
   - `rifas-app/src/css/modules/[feature].scss` - Estilos del módulo específico
   - `rifas-app/src/css/components.scss` - Estilos reutilizables de componentes generales
   - `rifas-app/src/css/utilities.scss` - Utilidades y clases helpers globales
   - `rifas-app/src/css/variables.scss` - Variables y temas globales
   - `rifas-app/src/css/app.scss` - **Punto de entrada central** que importa todos los estilos distribuidos

3. **Mantenibilidad**: El archivo `app.scss` centraliza los imports de forma que los estilos se puedan leer y mantener de forma sencilla:

```scss
// rifas-app/src/css/app.scss
@import 'variables.scss';
@import 'utilities.scss';
@import 'components.scss';
@import 'modules/rifas.scss';
@import 'modules/prizes.scss';
@import 'modules/tickets.scss';
// ... más módulos
```

## Pre-Commit

```bash
npm run lint && npm run format
```
