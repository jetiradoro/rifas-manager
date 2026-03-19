import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO para sortear un premio individual.
 */
export class DrawSinglePrizeDto {
  /**
   * Nombre del premio (opcional).
   */
  @IsOptional()
  @IsString({ message: 'El nombre del premio debe ser un texto.' })
  @MaxLength(100, {
    message: 'El nombre del premio no puede exceder 100 caracteres.',
  })
  prizeName?: string;
}
