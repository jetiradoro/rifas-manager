/**
 * Configuración de la app leída desde variables de entorno.
 * Las variables con prefijo VITE_ se definen en .env y quasar.config.ts
 * En producción, Vite sustituye import.meta.env en tiempo de build.
 */
const runtimeConfig =
    (
        window as Window & {
            __RIFAS_RUNTIME_CONFIG__?: Record<string, string | undefined>;
        }
    ).__RIFAS_RUNTIME_CONFIG__ ?? {};

export const appConfig = {
    apiBaseUrl: runtimeConfig.VITE_API_BASE || import.meta.env.VITE_API_BASE || 'http://rifas-api:80',
    apiToken: runtimeConfig.VITE_API_TOKEN || import.meta.env.VITE_API_TOKEN || '',
    packageName: runtimeConfig.VITE_PACKAGE_NAME || import.meta.env.VITE_PACKAGE_NAME || 'rifas-app',
    packageVersion:
        runtimeConfig.VITE_PACKAGE_VERSION || import.meta.env.VITE_PACKAGE_VERSION || '0.0.0',
    appName: runtimeConfig.VITE_APP_NAME || import.meta.env.VITE_APP_NAME || 'Rifas Manager',
    version: runtimeConfig.VITE_APP_VERSION || import.meta.env.VITE_APP_VERSION || '0.0.0',
    contactEmail: runtimeConfig.VITE_CONTACT_EMAIL || import.meta.env.VITE_CONTACT_EMAIL || '',
    contactAddress:
        runtimeConfig.VITE_CONTACT_ADDRESS || import.meta.env.VITE_CONTACT_ADDRESS || '',
    contactPhone: runtimeConfig.VITE_CONTACT_PHONE || import.meta.env.VITE_CONTACT_PHONE || '',
    jwt_token: runtimeConfig.VITE_JWT_TOKEN || import.meta.env.VITE_JWT_TOKEN || '',
    demo_env: runtimeConfig.VITE_DEMO_ENV || import.meta.env.VITE_DEMO_ENV || 'false',
};
