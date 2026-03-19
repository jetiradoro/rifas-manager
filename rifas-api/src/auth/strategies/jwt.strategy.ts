import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

/**
 * Payload del JWT.
 */
export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

/**
 * Estrategia JWT para autenticación.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'default-secret-key',
    });
  }

  /**
   * Valida el payload del JWT y retorna el usuario.
   * @param payload Payload del JWT
   * @returns Usuario extraído del token
   */
  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return {
      id: payload.sub,
      name: user.name,
      email: payload.email,
      role: payload.role,
    };
  }
}
