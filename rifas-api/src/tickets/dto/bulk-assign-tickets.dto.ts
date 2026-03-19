import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

/**
 * Datos para asignar uno o varios tickets a una persona.
 */
export class BulkAssignTicketsDto {
  @IsArray({ message: 'El campo "ticketNumbers" debe ser un array.' })
  @IsInt({ each: true, message: 'Cada número de ticket debe ser numérico.' })
  @Min(1, {
    each: true,
    message: 'Cada número de ticket debe ser mayor o igual que 1.',
  })
  ticketNumbers!: number[];

  @IsInt({ message: 'El campo "personId" debe ser numérico.' })
  personId!: number;

  @IsEnum(['reserved', 'paid'], {
    message: 'El campo "status" debe ser reserved o paid.',
  })
  status!: 'reserved' | 'paid';

  @IsString({
    message: 'El campo "observations" debe ser una cadena de texto.',
  })
  @IsOptional()
  observations?: string;
}
