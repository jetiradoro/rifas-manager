import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CreateRifaDto } from './create-rifa.dto';

/**
 * Datos para modificar parcialmente una rifa existente.
 */
export class UpdateRifaDto implements Partial<CreateRifaDto> {
  @IsString({ message: 'El campo "name" debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El campo "name" no puede estar vacío.' })
  @IsOptional()
  name?: string;

  @IsInt({ message: 'El campo "n_tickets" debe ser numérico.' })
  @Min(1, { message: 'El campo "n_tickets" debe ser mayor o igual que 1.' })
  @IsOptional()
  n_tickets?: number;

  @IsDateString(
    {},
    { message: 'El campo "fecha" debe ser una fecha válida (ISO 8601).' },
  )
  @IsOptional()
  fecha?: string;

  @IsInt({ message: 'El campo "n_prizes" debe ser numérico.' })
  @Min(1, { message: 'El campo "n_prizes" debe ser mayor o igual que 1.' })
  @IsOptional()
  n_prizes?: number;

  @IsOptional()
  @IsArray({ message: 'El campo "prize_names" debe ser un array.' })
  @IsString({ each: true, message: 'Cada nombre de premio debe ser texto.' })
  prize_names?: string[];
}
