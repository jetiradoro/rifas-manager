import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

/**
 * Datos para modificar parcialmente una persona existente.
 * Nota: La validación de "al menos un contacto" se hace en el servicio
 * para updates, ya que necesita considerar los valores actuales de la BD.
 */
export class UpdatePersonDto {
  @IsString({ message: 'El campo "name" debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El campo "name" no puede estar vacío.' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'El campo "surname" debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El campo "surname" no puede estar vacío.' })
  @IsOptional()
  surname?: string;

  @IsString({ message: 'El campo "phone" debe ser una cadena de texto.' })
  @ValidateIf((o) => o.phone !== undefined && o.phone !== null)
  @IsOptional()
  phone?: string | null;

  @ValidateIf(
    (o) => o.email !== undefined && o.email !== null && o.email !== '',
  )
  @IsEmail({}, { message: 'El campo "email" debe ser un email válido.' })
  @IsOptional()
  email?: string | null;
}
