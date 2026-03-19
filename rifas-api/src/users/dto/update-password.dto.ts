import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO para que un usuario cambie su contraseña.
 */
export class UpdatePasswordDto {
  @IsString({ message: 'La nueva contraseña debe ser texto.' })
  @MinLength(6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres.',
  })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria.' })
  newPassword: string;
}
