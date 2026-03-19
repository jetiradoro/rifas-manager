import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RifasService } from './rifas.service';
import { CreateRifaDto } from './dto/create-rifa.dto';
import { UpdateRifaDto } from './dto/update-rifa.dto';
import { TicketsService } from '../tickets/tickets.service';
import { BulkAssignTicketsDto } from '../tickets/dto/bulk-assign-tickets.dto';

/**
 * Controlador HTTP para gestionar las rutas CRUD de rifas.
 */
@Controller('rifas')
export class RifasController {
  constructor(
    private readonly rifasService: RifasService,
    private readonly ticketsService: TicketsService,
  ) {}

  /**
   * Crea una nueva rifa.
   * @param body Datos de creación
   * @returns Rifa creada
   */
  @Post()
  create(@Body() body: CreateRifaDto) {
    try {
      return this.rifasService.create(body);
    } catch (error) {
      console.error('Error al crear la rifa', error);
      throw new HttpException(
        `Error al crear la rifa: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lista todas las rifas.
   * @returns Array de rifas
   */
  @Get()
  findAll() {
    try {
      return this.rifasService.findAll();
    } catch (error) {
      console.error('Error al listar rifas', error);
      throw new HttpException(
        `Error al listar rifas: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtiene una rifa por id con tickets, premios y resumen.
   * @param id Identificador numérico
   * @returns Rifa encontrada con relaciones y resumen
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const rifaId = Number(id);
      const rifa = await this.rifasService.findOne(rifaId);

      if (!rifa) {
        throw new HttpException('Rifa no encontrada', HttpStatus.NOT_FOUND);
      }

      const summary = await this.rifasService.getSummary(rifaId);

      return {
        ...rifa,
        summary,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al obtener la rifa', error);
      throw new HttpException(
        `Error al obtener la rifa: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Actualiza parcialmente una rifa.
   * @param id Identificador de la rifa
   * @param body Datos a modificar
   * @returns Rifa actualizada
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateRifaDto) {
    try {
      const rifa = await this.rifasService.update(Number(id), body);
      return rifa;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al actualizar la rifa', error.message);
      throw new HttpException(
        `Error al actualizar la rifa`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Elimina una rifa.
   * @param id Identificador de la rifa
   * @returns Rifa eliminada
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    try {
      return this.rifasService.remove(Number(id));
    } catch (error) {
      console.error('Error al eliminar la rifa', error);
      throw new HttpException(
        `Error al eliminar la rifa: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtiene todos los tickets de una rifa.
   * @param rifaId Identificador de la rifa
   * @returns Array de tickets
   */
  @Get(':rifaId/tickets')
  getTickets(@Param('rifaId') rifaId: string) {
    try {
      return this.ticketsService.findByRifa(Number(rifaId));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al listar tickets', error);
      throw new HttpException(
        `Error al listar tickets: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Asigna uno o varios tickets a una persona.
   * @param rifaId Identificador de la rifa
   * @param body Datos de asignación
   * @returns Tickets asignados
   */
  @Post(':rifaId/tickets/assign')
  assignTickets(
    @Param('rifaId') rifaId: string,
    @Body() body: BulkAssignTicketsDto,
  ) {
    try {
      return this.ticketsService.assignTickets(Number(rifaId), body);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al asignar tickets', error);
      throw new HttpException(
        `Error al asignar tickets: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
