import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { BulkAssignTicketsDto } from './dto/bulk-assign-tickets.dto';

/**
 * Servicio de dominio para operaciones sobre tickets.
 */
@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un ticket con los datos indicados.
   * @param data Datos del ticket a crear
   * @returns Ticket persistido
   */
  async create(data: CreateTicketDto) {
    const rifaExists = await this.prisma.rifa.findUnique({
      where: { id: data.rifaId },
    });
    if (!rifaExists) {
      throw new NotFoundException('Rifa no encontrada.');
    }

    const existing = await this.prisma.ticket.findUnique({
      where: {
        rifaId_number: {
          rifaId: data.rifaId,
          number: data.number,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        'Ya existe un ticket con ese número en esta rifa.',
      );
    }

    if (data.personId) {
      const personExists = await this.prisma.person.findUnique({
        where: { id: data.personId },
      });
      if (!personExists) {
        throw new NotFoundException('Persona no encontrada.');
      }
    }

    return this.prisma.ticket.create({
      data: {
        number: data.number,
        rifaId: data.rifaId,
        personId: data.personId,
        status: data.status || 'available',
        observations: data.observations,
      },
    });
  }

  /**
   * Obtiene todos los tickets de una rifa.
   * @param rifaId Identificador de la rifa
   * @returns Lista de tickets con información de persona
   */
  async findByRifa(rifaId: number) {
    const rifaExists = await this.prisma.rifa.findUnique({
      where: { id: rifaId },
    });
    if (!rifaExists) {
      throw new NotFoundException('Rifa no encontrada.');
    }

    return this.prisma.ticket.findMany({
      where: { rifaId },
      include: {
        person: true,
      },
      orderBy: { number: 'asc' },
    });
  }

  /**
   * Asigna uno o varios tickets a una persona (compra individual o masiva).
   * @param rifaId Identificador de la rifa
   * @param data Datos de asignación (números, persona, estado)
   * @returns Tickets actualizados
   */
  async assignTickets(rifaId: number, data: BulkAssignTicketsDto) {
    const rifaExists = await this.prisma.rifa.findUnique({
      where: { id: rifaId },
    });
    if (!rifaExists) {
      throw new NotFoundException('Rifa no encontrada.');
    }

    const personExists = await this.prisma.person.findUnique({
      where: { id: data.personId },
    });
    if (!personExists) {
      throw new NotFoundException('Persona no encontrada.');
    }

    const tickets = await this.prisma.ticket.findMany({
      where: {
        rifaId,
        number: { in: data.ticketNumbers },
      },
    });

    if (tickets.length !== data.ticketNumbers.length) {
      throw new NotFoundException(
        'Algunos números de ticket no existen en esta rifa.',
      );
    }

    const unavailableTickets = tickets.filter(
      (ticket) => ticket.personId !== null && ticket.status !== 'available',
    );
    if (unavailableTickets.length > 0) {
      throw new ConflictException(
        `Los tickets ${unavailableTickets.map((t) => t.number).join(', ')} ya están asignados.`,
      );
    }

    await this.prisma.ticket.updateMany({
      where: {
        rifaId,
        number: { in: data.ticketNumbers },
      },
      data: {
        personId: data.personId,
        status: data.status,
        observations: data.observations,
      },
    });

    return this.prisma.ticket.findMany({
      where: {
        rifaId,
        number: { in: data.ticketNumbers },
      },
      include: {
        person: true,
      },
    });
  }

  /**
   * Actualiza un ticket (estado, observaciones).
   * @param id Identificador del ticket
   * @param data Campos a modificar
   * @returns Ticket actualizado
   */
  async update(id: number, data: UpdateTicketDto) {
    const existing = await this.prisma.ticket.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Ticket no encontrado.');
    }

    if (data.personId !== undefined && data.personId !== null) {
      const personExists = await this.prisma.person.findUnique({
        where: { id: data.personId },
      });
      if (!personExists) {
        throw new NotFoundException('Persona no encontrada.');
      }
    }

    return this.prisma.ticket.update({
      where: { id },
      data: {
        personId: data.personId,
        status: data.status,
        observations: data.observations,
      },
      include: {
        person: true,
      },
    });
  }

  /**
   * Libera un ticket (desasigna de persona).
   * @param id Identificador del ticket
   * @returns Ticket liberado
   */
  async release(id: number) {
    const existing = await this.prisma.ticket.findUnique({
      where: { id },
      include: { prizes: true },
    });
    if (!existing) {
      throw new NotFoundException('Ticket no encontrado.');
    }

    if (existing.prizes.length > 0) {
      throw new ConflictException(
        'No se puede liberar un ticket que ha sido premiado.',
      );
    }

    return this.prisma.ticket.update({
      where: { id },
      data: {
        personId: null,
        status: 'available',
        observations: null,
      },
    });
  }
}
