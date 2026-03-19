import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { ManualPrizeDto } from './dto/manual-prize.dto';

/**
 * Controlador HTTP para gestionar premios y sorteos.
 */
@Controller('prizes')
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  /**
   * Obtiene todos los premios de una rifa.
   * @param rifaId Identificador de la rifa
   * @returns Array de premios
   */
  @Get('rifa/:rifaId')
  findByRifa(@Param('rifaId') rifaId: string) {
    try {
      return this.prizesService.findByRifa(Number(rifaId));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al listar premios', error);
      throw new HttpException(
        `Error al listar premios: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Ejecuta el sorteo de una rifa.
   * @param rifaId Identificador de la rifa
   * @returns Premios generados
   */
  @Post('rifa/:rifaId/draw')
  draw(@Param('rifaId') rifaId: string) {
    try {
      return this.prizesService.draw(Number(rifaId));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al ejecutar el sorteo', error);
      throw new HttpException(
        `Error al ejecutar el sorteo: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Sortea un único premio de una rifa.
   * @param rifaId Identificador de la rifa
   * @param prizeOrder Orden del premio a sortear
   * @returns Premio generado
   */
  @Post('rifa/:rifaId/draw/:prizeOrder')
  drawSinglePrize(
    @Param('rifaId') rifaId: string,
    @Param('prizeOrder') prizeOrder: string,
  ) {
    try {
      return this.prizesService.drawSinglePrize(
        Number(rifaId),
        Number(prizeOrder),
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al sortear premio individual', error);
      throw new HttpException(
        `Error al sortear premio individual: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Crea un premio manualmente asignando un número específico.
   * @param rifaId Identificador de la rifa
   * @param dto Datos del premio manual (prizeOrder y ticketNumber)
   * @returns Premio creado
   */
  @Post('rifa/:rifaId/manual')
  createManual(@Param('rifaId') rifaId: string, @Body() dto: ManualPrizeDto) {
    try {
      return this.prizesService.createManual(Number(rifaId), dto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al crear premio manual', error);
      throw new HttpException(
        `Error al crear premio manual: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Elimina un premio específico.
   * @param id Identificador del premio
   * @returns Premio eliminado
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    try {
      return this.prizesService.remove(Number(id));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al eliminar el premio', error);
      throw new HttpException(
        `Error al eliminar el premio: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Elimina todos los premios de una rifa.
   * @param rifaId Identificador de la rifa
   * @returns Cantidad de premios eliminados
   */
  @Delete('rifa/:rifaId')
  removeAll(@Param('rifaId') rifaId: string) {
    try {
      return this.prizesService.removeAll(Number(rifaId));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al eliminar los premios', error);
      throw new HttpException(
        `Error al eliminar los premios: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
