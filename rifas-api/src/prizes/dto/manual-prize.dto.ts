import { IsInt, Min } from 'class-validator';

/**
 * DTO para la creación manual de un premio.
 */
export class ManualPrizeDto {
  /**
   * Orden del premio (1=gordo, 2=segundo, etc).
   */
  @IsInt({ message: 'El orden del premio debe ser un número entero' })
  @Min(1, { message: 'El orden del premio debe ser al menos 1' })
  prizeOrder: number;

  /**
   * Número del ticket ganador.
   */
  @IsInt({ message: 'El número de ticket debe ser un número entero' })
  @Min(1, { message: 'El número de ticket debe ser al menos 1' })
  ticketNumber: number;
}
