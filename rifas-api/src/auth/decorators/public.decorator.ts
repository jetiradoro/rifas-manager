import { SetMetadata } from '@nestjs/common';

/**
 * Clave para metadata de rutas públicas.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator para marcar rutas como públicas (sin autenticación).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
