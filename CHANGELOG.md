# CONTROL DE VERSIONES

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