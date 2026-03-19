import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

/**
 * Datos necesarios para crear una rifa.
 */
export class CreateRifaDto {
  @IsString({ message: 'El campo "name" debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El campo "name" es obligatorio.' })
  name!: string;

  @IsInt({ message: 'El campo "n_tickets" debe ser numérico.' })
  @Min(1, { message: 'El campo "n_tickets" debe ser mayor o igual que 1.' })
  n_tickets!: number;

  @IsDateString(
    {},
    { message: 'El campo "fecha" debe ser una fecha válida (ISO 8601).' },
  )
  fecha!: string;

  @IsInt({ message: 'El campo "n_prizes" debe ser numérico.' })
  @Min(1, { message: 'El campo "n_prizes" debe ser mayor o igual que 1.' })
  n_prizes!: number;

  @IsOptional()
  @IsArray({ message: 'El campo "prize_names" debe ser un array.' })
  @IsString({ each: true, message: 'Cada nombre de premio debe ser texto.' })
  prize_names?: string[];
}
