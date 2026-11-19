# CONTROL DE VERSIONES

## v1.6.0 - 2026-11-19

### Novedades
- Rifa: filtro por persona en el detalle. Desplegable con las personas que tienen números
  reservados o pagados en esa rifa, con resumen de pagados y pendientes de pago (filtrado en memoria)
- Navegación móvil: barra inferior con iconos (Rifas, Personas y Configuración); Configuración abre
  un submenú con Usuarios y Mi perfil. La hamburguesa se mantiene (políticas y condiciones)
- Botón de acción de página (`Nueva rifa`, `Nueva persona`, `Nuevo usuario`): barra a todo el ancho
  sobre el menú inferior en móvil y botón con texto en escritorio

### Mejoras
- Detalle de rifa: resumen en mini-tarjetas compactas, mucho menos alto en móvil
- Botón de volver arriba: ahora es una píldora «Inicio» que aparece al subir con el scroll
  y se oculta sola

### Correcciones
- Sorteo y asignación manual de premios: solo participan los números pagados (no libres ni reservados)
- Sorteo: no se permite realizarlo si no hay números pagados sin premio (evita que la
  animación quede girando)

---

## v1.5.2 - 2026-11-15

### Mejoras
- Docker: la instalación de dependencias y el build de app y API pasan al `docker build`
  (Dockerfile multi-stage con targets `dev` y `prod`, elegidos con `APP_TARGET` y `API_TARGET`)
- Arranque en producción más ligero: la API solo aplica migraciones, seed y `start:prod`;
  la app solo genera `runtime-config.js` y sirve los estáticos
- Deploy de GitHub Actions: `docker compose up -d --build` en lugar de `docker restart`
- Nuevo `docker-compose.override.yml` solo para desarrollo (bind mounts del código)

---

## v1.0.0 - 2026-03-19

### Novedades
- Versión inicial del proyecto estable
- Módulos:
    - Gestioón de administradores
    - Gestión de personas participantes
    - Gestión de sorteos
    - Gestión de tickets
    - Sorteos
    - Asignación de premios

---