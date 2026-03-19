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
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { BulkAssignTicketsDto } from './dto/bulk-assign-tickets.dto';

/**
 * Controlador HTTP para gestionar las rutas de tickets.
 */
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * Crea un nuevo ticket.
   * @param body Datos de creación
   * @returns Ticket creado
   */
  @Post()
  create(@Body() body: CreateTicketDto) {
    try {
      return this.ticketsService.create(body);
    } catch (error) {
      console.error('Error al crear el ticket', error);
      throw new HttpException(
        `Error al crear el ticket: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtiene todos los tickets de una rifa.
   * @param rifaId Identificador de la rifa
   * @returns Array de tickets
   */
  @Get('rifa/:rifaId')
  findByRifa(@Param('rifaId') rifaId: string) {
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
  @Post('rifa/:rifaId/assign')
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

  /**
   * Actualiza un ticket (estado, observaciones).
   * @param id Identificador del ticket
   * @param body Datos a modificar
   * @returns Ticket actualizado
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateTicketDto) {
    try {
      const ticket = await this.ticketsService.update(Number(id), body);
      return ticket;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al actualizar el ticket', error);
      throw new HttpException(
        `Error al actualizar el ticket`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Libera un ticket (desasigna de persona).
   * @param id Identificador del ticket
   * @returns Ticket liberado
   */
  @Delete(':id/release')
  release(@Param('id') id: string) {
    try {
      return this.ticketsService.release(Number(id));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al liberar el ticket', error);
      throw new HttpException(
        `Error al liberar el ticket: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
