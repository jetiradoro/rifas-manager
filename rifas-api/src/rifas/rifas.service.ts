import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRifaDto } from './dto/create-rifa.dto';
import { UpdateRifaDto } from './dto/update-rifa.dto';

/**
 * Servicio de dominio para operaciones CRUD sobre rifas.
 */
@Injectable()
export class RifasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una rifa con los datos indicados y genera automáticamente sus tickets.
   * @param data Datos de la rifa a crear
   * @returns Rifa persistida
   */
  async create(data: CreateRifaDto) {
    const existing = await this.prisma.rifa.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new ConflictException('Ya existe una rifa con ese nombre.');
    }

    const rifa = await this.prisma.rifa.create({
      data: {
        name: data.name,
        n_tickets: data.n_tickets,
        fecha: new Date(data.fecha),
        n_prizes: data.n_prizes,
        prize_names: data.prize_names || undefined,
      },
    });

    const ticketsData: Array<{
      number: number;
      rifaId: number;
      status: 'available';
    }> = [];
    for (let i = 1; i <= data.n_tickets; i++) {
      ticketsData.push({
        number: i,
        rifaId: rifa.id,
        status: 'available',
      });
    }

    await this.prisma.ticket.createMany({
      data: ticketsData,
    });

    return rifa;
  }

  /**
   * Obtiene todas las rifas registradas.
   * @returns Lista de rifas
   */
  async findAll() {
    return this.prisma.rifa.findMany({
      include: {
        prizes: {
          select: {
            id: true,
            prizeOrder: true,
            ticket: {
              select: {
                number: true,
              },
            },
            person: {
              select: {
                name: true,
                surname: true,
              },
            },
          },
          orderBy: {
            prizeOrder: 'asc',
          },
        },
      },
    });
  }

  /**
   * Obtiene una rifa por su identificador con relaciones de tickets y premios.
   * @param id Identificador numérico de la rifa
   * @returns Rifa encontrada con relaciones o null
   */
  async findOne(id: number) {
    return this.prisma.rifa.findUnique({
      where: { id },
      include: {
        tickets: {
          include: {
            person: true,
          },
        },
        prizes: {
          include: {
            ticket: true,
            person: true,
          },
        },
      },
    }) as any;
  }

  /**
   * Obtiene un resumen de tickets de una rifa (vendidos, libres, total).
   * @param id Identificador numérico de la rifa
   * @returns Resumen con contadores
   */
  async getSummary(id: number) {
    const rifa = await this.prisma.rifa.findUnique({ where: { id } });
    if (!rifa) {
      throw new NotFoundException('Rifa no encontrada.');
    }

    const ticketStats = await this.prisma.ticket.groupBy({
      by: ['status'],
      where: { rifaId: id },
      _count: true,
    });

    let sold = 0;
    for (const stat of ticketStats) {
      if (stat.status === 'reserved' || stat.status === 'paid') {
        sold += stat._count;
      }
    }

    const available = rifa.n_tickets - sold;

    return {
      total: rifa.n_tickets,
      sold,
      available,
    };
  }

  /**
   * Actualiza parcialmente una rifa.
   * @param id Identificador de la rifa
   * @param data Campos a modificar
   * @returns Rifa actualizada
   */
  async update(id: number, data: UpdateRifaDto) {
    const existing = await this.prisma.rifa.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Rifa no encontrada.');
    }

    const updatePayload: Prisma.RifaUpdateInput = {
      name: data.name ?? undefined,
      n_prizes: data.n_prizes ?? undefined,
      prize_names:
        data.prize_names !== undefined ? data.prize_names : undefined,
      fecha: data.fecha ? new Date(data.fecha) : undefined,
    };

    if (data.n_tickets === undefined || data.n_tickets === existing.n_tickets) {
      return this.prisma.rifa.update({
        where: { id },
        data: updatePayload,
      });
    }

    updatePayload.n_tickets = data.n_tickets;

    if (data.n_tickets < existing.n_tickets) {
      const blockedTickets = await this.prisma.ticket.findMany({
        where: {
          rifaId: id,
          number: { gt: data.n_tickets },
          status: { in: ['reserved', 'paid'] },
        },
        select: { number: true },
      });

      if (blockedTickets.length > 0) {
        const numbers = blockedTickets
          .map((ticket) => ticket.number)
          .join(', ');
        throw new ConflictException(
          `No se puede reducir el número de tickets porque los tickets ${numbers} están vendidos o reservados.`,
        );
      }

      return this.prisma.$transaction(async (tx) => {
        await tx.ticket.deleteMany({
          where: {
            rifaId: id,
            number: { gt: data.n_tickets },
          },
        });

        await tx.rifa.update({
          where: { id },
          data: updatePayload,
        });

        return tx.rifa.findUnique({ where: { id } });
      });
    }

    const newTickets: Array<{
      number: number;
      rifaId: number;
      status: 'available';
    }> = [];
    for (let i = existing.n_tickets + 1; i <= data.n_tickets; i++) {
      newTickets.push({ number: i, rifaId: id, status: 'available' });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.rifa.update({ where: { id }, data: updatePayload });
      await tx.ticket.createMany({ data: newTickets, skipDuplicates: true });
      return tx.rifa.findUnique({ where: { id } });
    });
  }

  /**
   * Elimina una rifa por su identificador.
   * @param id Identificador de la rifa
   * @returns Rifa eliminada
   */
  async remove(id: number) {
    return this.prisma.rifa.delete({ where: { id } });
  }
}
