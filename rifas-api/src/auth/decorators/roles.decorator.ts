import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

/**
 * Clave para almacenar metadata de roles.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator para especificar roles permitidos en una ruta.
 * @param roles Roles permitidos
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
