/**
 * Configuración de la app leída desde variables de entorno.
 * Las variables con prefijo VITE_ se definen en .env y quasar.config.ts
 * En producción, Vite sustituye import.meta.env en tiempo de build.
 */
export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE ?? 'http://rifas-api:80',
  apiToken: import.meta.env.VITE_API_TOKEN ?? '',
  packageName: import.meta.env.VITE_PACKAGE_NAME ?? 'rifas-app',
  packageVersion: import.meta.env.VITE_PACKAGE_VERSION ?? '0.0.0',
  appName: import.meta.env.VITE_APP_NAME ?? 'Rifas Manager',
  version: import.meta.env.VITE_APP_VERSION ?? '0.0.0',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL ?? '',
  contactAddress: import.meta.env.VITE_CONTACT_ADDRESS ?? '',
  contactPhone: import.meta.env.VITE_CONTACT_PHONE ?? '',
  jwt_token: import.meta.env.VITE_JWT_TOKEN ?? '',

};
