# Patrones de Comportamiento

## Backend (NestJS)

### Configuración Global (main.ts)

```typescript
app.enableCors({ origin: true, credentials: true });
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
app.useGlobalInterceptors(new DateFormatInterceptor());
```

### ApiTokenGuard (Global)

- Valida `Authorization: Bearer <token>` en todas las rutas
- Token comparado con `appConfig.apiToken` (desde env)
- Lanza `UnauthorizedException` o `ForbiddenException`

### RequestLoggerMiddleware

- Registra todas las peticiones HTTP
- Aplicado globalmente a ruta `*`

### DateFormatInterceptor

- Formatea fechas a `YYYY-MM-DD HH:mm:ss` usando dayjs
- Aplica recursivamente a objetos y arrays

### Patrón de Servicio

```typescript
@Injectable()
export class RifasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRifaDto) {
    // 1. Validar reglas de negocio
    const existing = await this.prisma.rifa.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new ConflictException('Ya existe una rifa con ese nombre.');
    }

    // 2. Realizar operación
    return this.prisma.rifa.create({ data: {...} });
  }
}
```

### DTOs con Validación

```typescript
import { IsString, IsInt, IsDateString, Min } from 'class-validator';

export class CreateRifaDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  n_tickets: number;

  @IsDateString()
  fecha: string;

  @IsInt()
  @Min(1)
  n_prizes: number;
}
```

**Decoradores comunes**: `@IsString()`, `@IsInt()`, `@IsBoolean()`, `@IsDateString()`, `@IsEmail()`, `@Min()`, `@Max()`, `@Length()`, `@IsOptional()`

### Controladores REST

```typescript
@Controller('rifas')
export class RifasController {
  constructor(private readonly rifasService: RifasService) {}

  @Get()
  findAll() {
    return this.rifasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rifasService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateRifaDto) {
    return this.rifasService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRifaDto) {
    return this.rifasService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rifasService.remove(+id);
  }
}
```

### Excepciones Estándar

```typescript
throw new NotFoundException('Rifa no encontrada.');
throw new ConflictException('Ya existe una rifa con ese nombre.');
throw new BadRequestException('Datos inválidos.');
throw new UnauthorizedException('Falta el token de autorización.');
throw new ForbiddenException('Token de acceso no válido.');
```

## Frontend (Quasar/Vue 3)

### Composition API

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRifasStore } from '../stores/rifas-store';

const props = defineProps<{ rifaId: number }>();
const emit = defineEmits<{ (e: 'updated', rifa: Rifa): void }>();

const rifasStore = useRifasStore();
const loading = ref(false);

const rifa = computed(() =>
  rifasStore.rifas.find(r => r.id === props.rifaId)
);

async function loadRifa() {
  loading.value = true;
  try {
    await rifasStore.fetchRifa(props.rifaId);
  } finally {
    loading.value = false;
  }
}

onMounted(loadRifa);
</script>
```

### Pinia Store

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'boot/axios';

export const useRifasStore = defineStore('rifas', () => {
  const rifas = ref<Rifa[]>([]);
  const loading = ref(false);

  const rifaCount = computed(() => rifas.value.length);

  async function fetchRifas() {
    loading.value = true;
    try {
      const response = await api.get('/rifas');
      rifas.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function createRifa(data: CreateRifaDto) {
    const response = await api.post('/rifas', data);
    rifas.value.push(response.data);
    return response.data;
  }

  return { rifas, loading, rifaCount, fetchRifas, createRifa };
});
```

### Axios Config (boot/axios.ts)

```typescript
import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { config } from 'src/config';

const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { Authorization: `Bearer ${config.apiToken}` },
});

export default boot(({ app }) => {
  app.config.globalProperties.$api = api;
});

export { api };
```

### Formularios con Validación

```vue
<q-form @submit="onSubmit">
  <q-input
    v-model="form.name"
    label="Nombre"
    :rules="[
      val => !!val || 'El nombre es requerido',
      val => val.length >= 3 || 'Mínimo 3 caracteres'
    ]"
  />
  <q-btn type="submit" label="Guardar" color="primary" />
</q-form>

<script setup lang="ts">
const form = ref({ name: '', n_tickets: 0, fecha: '', n_prizes: 1 });

async function onSubmit() {
  try {
    await rifasStore.createRifa(form.value);
    $q.notify({ type: 'positive', message: 'Rifa creada' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error' });
  }
}
</script>
```

### Notificaciones

```typescript
import { useQuasar } from 'quasar';
const $q = useQuasar();

$q.notify({ type: 'positive', message: 'Éxito' });
$q.notify({ type: 'negative', message: 'Error' });
```

### Diálogos

```typescript
$q.dialog({
  title: 'Confirmar',
  message: '¿Estás seguro?',
  cancel: true,
}).onOk(() => {
  // Acción confirmada
});
```

## Flujo Integración Frontend-Backend

1. Usuario interactúa → Componente Vue
2. Componente llama → Pinia Store
3. Store realiza → Petición Axios
4. Backend valida → ValidationPipe + DTOs
5. Guard verifica → Bearer token
6. Controller delega → Service
7. Service ejecuta → Lógica + Prisma
8. Interceptor formatea → Fechas
9. Store actualiza → Estado
10. Componente reactivo → Se actualiza

### Manejo de Errores End-to-End

```typescript
// Store
async function createRifa(data: CreateRifaDto) {
  try {
    const response = await api.post('/rifas', data);
    rifas.value.push(response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Error desconocido');
    }
    throw error;
  }
}

// Componente
async function handleCreate() {
  try {
    await rifasStore.createRifa(form.value);
    $q.notify({ type: 'positive', message: 'Rifa creada' });
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message });
  }
}
```

## Presentación de Funcionalidades

**Regla Importante**: Antes de llevar a cabo cualquier funcionalidad, se debe presentar una **hoja de ruta (roadmap)** de lo que se quiere hacer para que el usuario lo valide antes de comenzar a implementar.

La hoja de ruta debe incluir:
- Descripción general de la funcionalidad
- Módulos/archivos que se modificarán o crearán
- Cambios en backend (API)
- Cambios en frontend (App)
- Orden de implementación sugerido
- Consideraciones especiales o riesgos

## Gestión de Planes

**Regla Importante**: Los planes nunca se actualizan, son **inmutables** y solo se deben utilizar para lectura. Se facilitan **archivos de seguimiento más pequeños** que sí se permiten modificar para llevar el registro diario del progreso.

- **Planes** (inmutables): Documentos de referencia que definen la estrategia general
  - Ubicación: `.claude/plans/[nombre_plan]/[nombre_plan].md`
  - Uso: Solo lectura, referencia de lo planificado
  - Actualización: Nunca

- **Archivos de Seguimiento** (mutables): Documentos para rastrear el progreso diario
  - Ubicación: `.claude/plans/[nombre_plan]/ejecucion_*.md` o similares
  - Uso: Tracking de tareas completadas, pendientes, bloqueadores
  - Actualización: Frecuente para reflejar el progreso actual
