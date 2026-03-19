import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { appConfig } from '../config';
import { IS_PUBLIC_KEY } from '../auth/decorators/public.decorator';

/**
 * Valida que la petición incluya un bearer token válido en Authorization.
 * Omite validación para rutas marcadas con @Public().
 */
@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization as string | undefined;

    if (!authHeader) {
      throw new UnauthorizedException('Falta el token de autorización.');
    }

    const [, token] = authHeader.match(/^Bearer\s+(.+)$/i) ?? [];
    if (!token) {
      throw new UnauthorizedException('Formato de Authorization inválido.');
    }

    if (token !== appConfig.apiToken) {
      throw new ForbiddenException('Token de acceso no válido.');
    }

    return true;
  }
}
