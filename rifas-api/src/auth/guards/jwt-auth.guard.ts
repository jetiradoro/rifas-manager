import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard para proteger rutas con autenticación JWT.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
