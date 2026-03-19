import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { AtLeastOneContact } from '../validators/at-least-one-contact.validator';

/**
 * Datos necesarios para crear una persona.
 * Se requiere al menos teléfono o email.
 */
export class CreatePersonDto {
  @IsString({ message: 'El campo "name" debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El campo "name" es obligatorio.' })
  name!: string;

  @IsString({ message: 'El campo "surname" debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El campo "surname" es obligatorio.' })
  surname!: string;

  @AtLeastOneContact()
  @IsString({ message: 'El campo "phone" debe ser una cadena de texto.' })
  @IsNotEmpty({
    message: 'El campo "phone" no puede estar vacío si se proporciona.',
  })
  @IsOptional()
  phone?: string;

  @ValidateIf(
    (o) => o.email !== undefined && o.email !== null && o.email !== '',
  )
  @IsEmail({}, { message: 'El campo "email" debe ser un email válido.' })
  @IsOptional()
  email?: string;
}
