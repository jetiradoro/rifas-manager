import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard para autenticación con Google OAuth.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
