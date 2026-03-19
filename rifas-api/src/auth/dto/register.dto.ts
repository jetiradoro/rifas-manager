import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    IsOptional,
    IsInt,
} from 'class-validator';

/**
 * DTO para registro de nuevo usuario.
 */
export class RegisterDto {
    @IsEmail({}, { message: 'El email debe tener un formato válido.' })
    @IsNotEmpty({ message: 'El email es obligatorio.' })
    email: string;

    @IsString({ message: 'La contraseña debe ser texto.' })
    @MinLength(6, {
        message: 'La contraseña debe tener al menos 6 caracteres.',
    })
    @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
    password: string;

    @IsString({ message: 'El nombre debe ser texto.' })
    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    name: string;

    @IsInt({ message: 'El personId debe ser un número entero.' })
    @IsOptional()
    personId?: number;
}
