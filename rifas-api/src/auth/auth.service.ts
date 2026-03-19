import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { JwtPayload } from './strategies/jwt.strategy';

/**
 * Servicio de autenticación.
 */
@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    /**
     * Registra un nuevo usuario.
     * @param registerDto Datos de registro
     * @returns Token JWT y datos del usuario
     */
    async register(registerDto: RegisterDto) {
        const user = await this.usersService.create({
            email: registerDto.email,
            password: registerDto.password,
            name: registerDto.name,
            personId: registerDto.personId,
        });

        return this.generateAuthResponse(user);
    }

    /**
     * Autentica un usuario con email y password.
     * @param loginDto Credenciales de login
     * @returns Token JWT y datos del usuario
     */
    async login(loginDto: LoginDto) {
        const user = await this.usersService.validateCredentials(
            loginDto.email,
            loginDto.password,
        );

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas.');
        }

        return this.generateAuthResponse(user);
    }

    /**
     * Autentica o registra un usuario con Google OAuth.
     * @param googleUser Datos del usuario de Google
     * @returns Token JWT y datos del usuario
     */
    async googleLogin(googleUser: {
        googleId: string;
        email: string;
        name: string;
        avatar?: string;
    }) {
        let user = await this.usersService.findByGoogleId(googleUser.googleId);

        if (!user) {
            // Si no existe, buscar por email
            user = await this.usersService.findByEmail(googleUser.email);

            if (user) {
                // Usuario existe con ese email, vincular Google ID
                user = await this.usersService.update(user.id, {
                    googleId: googleUser.googleId,
                    avatar: googleUser.avatar,
                });
            } else {
                // Crear nuevo usuario
                user = await this.usersService.create({
                    email: googleUser.email,
                    name: googleUser.name,
                    googleId: googleUser.googleId,
                    avatar: googleUser.avatar,
                });
            }
        }

        return this.generateAuthResponse(user);
    }

    /**
     * Genera el token JWT y la respuesta de autenticación.
     * @param user Usuario autenticado
     * @returns Token JWT y datos del usuario
     */
    private generateAuthResponse(user: User) {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                personId: user.personId,
            },
        };
    }
}
