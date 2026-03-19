# Repository Guidelines

## Idioma
- Comunicaciones y documentación internas en castellano.

## Estructura del proyecto
El proyecto contiene 2 capas de servicios gestionadas con contenedores docker. 
- rifas-api con la api del backend y lógica de negocio en NestJS
- rifas-app con la parte frontend de la aplicación web en Quasar y Vue3
- La carpeta docker/rifas contiene las carpetas con los dockerfile y ficheros necesarios para la construcción de los contenedores y el docker-compose con la configuración del stack para gestionar los servicios. 

Todas las aplicaciones cargan variables de entorno configuradas en el archivo .env de la carpeta docker/rifas. Además de sus propias variables de entorno en cada aplicación. 

## Stack de contenedores
- Todo se gestiona con Docker y Docker Compose desde `docker/rifas`; ahí viven configuraciones y variables.
- `rifas-api`: API NestJS + TypeScript (raíz de contenedor `/app`, scripts `npm run start:dev` / `npm run start:prod`).
- `rifas-app`: app Quasar/Vue 3 + TypeScript (raíz de contenedor `/app`, scripts `quasar dev` / `quasar serve dist/spa`).
- El stack comparte variables de `.env` en `docker/rifas` y usa la red externa `docker-net`.
- Mapear carpetas de las aplicaciones dentro de sus contenedores y exponer `VIRTUAL_HOST` para el proxy nginx externo.
- Contenedores corren con usuario 1000 y grupo 1000, política `restart: unless-stopped`, root `/app` y comando `init-container.sh` según entorno (dev o prod).
- Puertos de servicio: 80 en desarrollo, 443 en producción; expuestos vía proxy inverso, no se hace `EXPOSE` en Dockerfiles.

## Comandos de build, test y desarrollo
- Flujo recomendado: `docker compose build` para construir imágenes y `docker compose up` para levantar el stack cuando exista el archivo Compose.
- Expon scripts de idioma en `Makefile` o `package.json` (p.ej., `make lint`, `make test`, `npm run dev`) para tener un único punto de entrada.
- Si agregas servicios nuevos, incluye `.env.example` alineado con variables usadas en Compose o en el runtime.

## Estilo de código y nombres
- Respeta el formateador del lenguaje (Prettier/ESLint para JS/TS). Añade un script `fmt` o `lint` y ejecútalo antes de commitear.
- Nombres descriptivos y consistentes: archivos reflejan lo que exportan (`raffle_service.js`, `RaffleRepository.ts`).
- Indentación sugerida: 4 espacios en JS/TS. Mantén líneas ≤100 caracteres salvo configuración distinta del proyecto.
- Funciones pequeñas y sin efectos colaterales inesperados; documenta comportamientos no obvios con docstrings o notas en README.

## Guía de pruebas
- Coloca pruebas unitarias junto al módulo; integra o E2E en `tests/` con subcarpetas (`integration`, `e2e`).
- Nombra las pruebas por el comportamiento comprobado (`should_create_raffle_with_unique_code`).
- Prioriza cobertura de reglas de negocio y rutas de error más que un porcentaje arbitrario.
- Para pruebas con dependencias, apóyate en Docker y deja scripts de seed o limpieza cuando sea necesario.

## Commits y Pull Requests
- Mensajes de commit en presente y útiles; se recomienda Conventional Commits (`feat:`, `fix:`, `chore:`) para claridad y changelog.
- PRs enfocados en un cambio; incluye resumen breve, notas de prueba ejecutada y pasos de entorno si aplican.
- Vincula issues relevantes e incluye capturas o salida de consola para cambios visibles (UI o CLI).
- Documenta comandos nuevos, configuraciones o carpetas añadidas en README o en esta guía para mantener alineación del equipo.

## Metodología de desarrollo
- Usar metodología SOLID y métodos de propósito único y todo el código bien estructurado. 
- Añadir documentanción de funcionamiento en la cabecera de cada método y clase con el objetivo del método, parámetros y respuesta.
- Todo el código debe respetar el standar eslint y las aplicaciones tienen la definición de eslint en su raíz
