import * as path from 'node:path';
import { config as loadEnv } from 'dotenv';

/**
 * Configuración centralizada de la aplicación derivada de variables de entorno.
 */
export interface AppConfig {
  env: string;
  port: number;
  databaseUrl: string;
  apiToken: string;
}

const envFilePath = path.resolve(__dirname, '..', '.env');

loadEnv({ path: envFilePath });

/**
 * Devuelve la configuración normalizada de la aplicación.
 */
export const appConfig: AppConfig = buildConfig();

/**
 * Construye el objeto de configuración tipado a partir de process.env.
 */
function buildConfig(): AppConfig {
  const port = Number(process.env.PORT ?? 3000);

  return {
    env: process.env.NODE_ENV ?? 'development',
    port: Number.isNaN(port) ? 3000 : port,
    databaseUrl: process.env.DATABASE_URL ?? '',
    apiToken: process.env.API_TOKEN ?? '',
  };
}
