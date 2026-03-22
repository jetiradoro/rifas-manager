# Hackathon CubePath

## Descripción del proyecto

Rifas Manager es una aplicación web para la gestión de rifas.
Permite administrar sorteos, participantes, boletos y autenticación de usuarios desde una
interfaz moderna.

El proyecto está organizado como monorepo y se despliega con contenedores para facilitar
el mantenimiento y la escalabilidad.

## Estructura general

- `rifas-app`: frontend en Quasar + Vue 3.
- `rifas-api`: backend en NestJS.
- `docker/rifas`: configuración de Docker Compose y variables de entorno.

## Demo y acceso

- Demo: https://rifas-manager.jetiradoro.com
- Usuario: demo@rifas-manager.com
- Contraseña: rifasDemo#2026

## Uso de CubePath

Para este proyecto se ha utilizado CubePath sobre un VPS `gp.micro`.

En ese servidor se ha desplegado Dokploy y, dentro de Dokploy, se han creado 3 servicios:

1. Servicio de frontend con Quasar y Vue 3.
2. Servicio de backend con una API desarrollada en NestJS.
3. Servicio de PostgreSQL para la persistencia de datos.

Este enfoque permite gestionar despliegues de forma centralizada, separando claramente
la capa de presentación, la lógica de negocio y la base de datos.
