import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * Datos necesarios para crear un ticket.
 */
export class CreateTicketDto {
  @IsInt({ message: 'El campo "number" debe ser numérico.' })
  @Min(1, { message: 'El campo "number" debe ser mayor o igual que 1.' })
  number!: number;

  @IsInt({ message: 'El campo "rifaId" debe ser numérico.' })
  rifaId!: number;

  @IsInt({ message: 'El campo "personId" debe ser numérico.' })
  @IsOptional()
  personId?: number;

  @IsEnum(['available', 'reserved', 'paid'], {
    message: 'El campo "status" debe ser available, reserved o paid.',
  })
  @IsOptional()
  status?: 'available' | 'reserved' | 'paid';

  @IsString({
    message: 'El campo "observations" debe ser una cadena de texto.',
  })
  @IsOptional()
  observations?: string;
}
