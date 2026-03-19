import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsInt,
    MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

/**
 * DTO para crear un usuario.
 */
export class CreateUserDto {
    @IsEmail({}, { message: 'El email debe tener un formato válido.' })
    @IsNotEmpty({ message: 'El email es obligatorio.' })
    email: string;

    @IsString({ message: 'La contraseña debe ser texto.' })
    @MinLength(6, {
        message: 'La contraseña debe tener al menos 6 caracteres.',
    })
    @IsOptional()
    password?: string;

    @IsString({ message: 'El nombre debe ser texto.' })
    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    name: string;

    @IsEnum(Role, { message: 'El rol debe ser admin o user.' })
    @IsOptional()
    role?: Role;

    @IsString({ message: 'El Google ID debe ser texto.' })
    @IsOptional()
    googleId?: string;

    @IsString({ message: 'El avatar debe ser una URL.' })
    @IsOptional()
    avatar?: string;

    @IsInt({ message: 'El personId debe ser un número entero.' })
    @IsOptional()
    personId?: number;
}
