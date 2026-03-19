import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

/**
 * Datos para modificar parcialmente un ticket existente.
 */
export class UpdateTicketDto {
  @IsInt({ message: 'El campo "personId" debe ser numérico.' })
  @IsOptional()
  personId?: number | null;

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
