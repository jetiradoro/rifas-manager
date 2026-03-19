import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para login de usuario.
 */
export class LoginDto {
    @IsEmail({}, { message: 'El email debe tener un formato válido.' })
    @IsNotEmpty({ message: 'El email es obligatorio.' })
    email: string;

    @IsString({ message: 'La contraseña debe ser texto.' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
    password: string;
}
