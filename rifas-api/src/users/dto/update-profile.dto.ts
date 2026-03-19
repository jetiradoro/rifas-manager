import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * DTO para que un usuario actualice su propio perfil.
 */
export class UpdateProfileDto {
    @IsString({ message: 'El nombre debe ser texto.' })
    @IsOptional()
    name?: string;

    @IsEmail({}, { message: 'El email debe tener un formato válido.' })
    @IsOptional()
    email?: string;
}
