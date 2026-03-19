import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard para verificar roles de usuario.
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    /**
     * Verifica si el usuario tiene uno de los roles requeridos.
     * @param context Contexto de ejecución
     * @returns True si el usuario tiene permiso, false en caso contrario
     */
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        return requiredRoles.some((role) => user.role === role);
    }
}
