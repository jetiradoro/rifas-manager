import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ManualPrizeDto } from './dto/manual-prize.dto';

/**
 * Servicio de dominio para operaciones sobre premios y sorteos.
 */
@Injectable()
export class PrizesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todos los premios de una rifa.
   * @param rifaId Identificador de la rifa
   * @returns Lista de premios con ticket y persona
   */
  async findByRifa(rifaId: number) {
    const rifaExists = await this.prisma.rifa.findUnique({
      where: { id: rifaId },
    });
    if (!rifaExists) {
      throw new NotFoundException('Rifa no encontrada.');
    }

    return this.prisma.prize.findMany({
      where: { rifaId },
      include: {
        ticket: true,
        person: true,
      },
      orderBy: { prizeOrder: 'asc' },
    });
  }

  /**
   * Ejecuta el sorteo de una rifa.
   * Selecciona aleatoriamente tickets vendidos para cada premio.
   * @param rifaId Identificador de la rifa
   * @returns Lista de premios generados ordenada (gordo primero)
   */
  async draw(rifaId: number) {
    const rifa = await this.prisma.rifa.findUnique({
      where: { id: rifaId },
    });
    if (!rifa) {
      throw new NotFoundException('Rifa no encontrada.');
    }

    const existingPrizes = await this.prisma.prize.findMany({
      where: { rifaId },
    });
    if (existingPrizes.length > 0) {
      throw new ConflictException(
        'Ya existen premios para esta rifa. Elimínalos antes de realizar un nuevo sorteo.',
      );
    }

    const soldTickets = await this.prisma.ticket.findMany({
      where: {
        rifaId,
        status: { in: ['reserved', 'paid'] },
        personId: { not: null },
      },
    });

    if (soldTickets.length < rifa.n_prizes) {
      throw new BadRequestException(
        `No hay suficientes tickets vendidos. Se necesitan al menos ${rifa.n_prizes} tickets vendidos para realizar el sorteo.`,
      );
    }

    const shuffled = [...soldTickets].sort(() => Math.random() - 0.5);
    const selectedTickets = shuffled.slice(0, rifa.n_prizes);

    const prizes: any[] = [];
    for (let i = 0; i < selectedTickets.length; i++) {
      const ticket = selectedTickets[i];
      const prize = await this.prisma.prize.create({
        data: {
          rifaId,
          ticketId: ticket.id,
          personId: ticket.personId!,
          prizeOrder: i + 1,
        },
        include: {
          ticket: true,
          person: true,
        },
      });
      prizes.push(prize);
    }

    return prizes;
  }

  /**
   * Elimina un premio específico.
   * @param id Identificador del premio
   * @returns Premio eliminado
   */
  async remove(id: number) {
    const prize = await this.prisma.prize.findUnique({ where: { id } });
    if (!prize) {
      throw new NotFoundException('Premio no encontrado.');
    }

    return this.prisma.prize.delete({ where: { id } });
  }

  /**
   * Sortea un único premio de una rifa.
   * @param rifaId Identificador de la rifa
   * @param prizeOrder Orden del premio a sortear (1=gordo, 2=segundo, etc)
   * @returns Premio generado con ticket y persona
   */
  async drawSinglePrize(rifaId: number, prizeOrder: number) {
    const rifa = await this.prisma.rifa.findUnique({
      where: { id: rifaId },
    });
    if (!rifa) {
      throw new NotFoundException('Rifa no encontrada.');
    }

    if (prizeOrder < 1 || prizeOrder > rifa.n_prizes) {
      throw new BadRequestException(
        `El orden del premio debe estar entre 1 y ${rifa.n_prizes}.`,
      );
    }

    const existingPrize = await this.prisma.prize.findFirst({
      where: { rifaId, prizeOrder },
    });
    if (existingPrize) {
      throw new ConflictException(
        `El premio número ${prizeOrder} ya ha sido sorteado.`,
      );
    }

    const alreadyWonTicketIds = await this.prisma.prize
      .findMany({
        where: { rifaId },
        select: { ticketId: true },
      })
      .then((prizes) => prizes.map((p) => p.ticketId));

    const soldTickets = await this.prisma.ticket.findMany({
      where: {
        rifaId,
        status: { in: ['reserved', 'paid'] },
        personId: { not: null },
        id: { notIn: alreadyWonTicketIds },
      },
    });

    if (soldTickets.length === 0) {
      throw new BadRequestException(
        'No hay tickets vendidos disponibles para sortear.',
      );
    }

    const randomIndex = Math.floor(Math.random() * soldTickets.length);
    const selectedTicket = soldTickets[randomIndex];

    const prize = await this.prisma.prize.create({
      data: {
        rifaId,
        ticketId: selectedTicket.id,
        personId: selectedTicket.personId!,
        prizeOrder,
      },
      include: {
        ticket: true,
        person: true,
        rifa: {
          select: {
            prize_names: true,
          },
        },
      },
    });

    return prize;
  }

  /**
   * Crea un premio manualmente asignando un número de ticket específico.
   * @param rifaId Identificador de la rifa
   * @param dto Datos del premio manual (prizeOrder y ticketNumber)
   * @returns Premio creado con ticket y persona
   */
  async createManual(rifaId: number, dto: ManualPrizeDto) {
    // Verificar que la rifa existe
    const rifa = await this.prisma.rifa.findUnique({
      where: { id: rifaId },
    });
    if (!rifa) {
      throw new NotFoundException('Rifa no encontrada.');
    }

    // Verificar que prizeOrder está en rango válido
    if (dto.prizeOrder < 1 || dto.prizeOrder > rifa.n_prizes) {
      throw new BadRequestException(
        `El orden del premio debe estar entre 1 y ${rifa.n_prizes}.`,
      );
    }

    // Verificar que no existe ya un premio para ese orden
    const existingPrize = await this.prisma.prize.findFirst({
      where: { rifaId, prizeOrder: dto.prizeOrder },
    });
    if (existingPrize) {
      throw new ConflictException(
        `El premio número ${dto.prizeOrder} ya ha sido asignado.`,
      );
    }

    // Verificar que el ticket existe y el número es válido
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        rifaId,
        number: dto.ticketNumber,
      },
      include: {
        person: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        `El ticket número ${dto.ticketNumber} no existe para esta rifa.`,
      );
    }

    // Verificar que el ticket tiene persona asignada (está vendido)
    if (!ticket.personId || !ticket.person) {
      throw new BadRequestException(
        `El ticket número ${dto.ticketNumber} no está vendido. Solo se pueden asignar premios a tickets vendidos.`,
      );
    }

    // Verificar que el ticket no ha ganado otro premio
    const ticketAlreadyWon = await this.prisma.prize.findFirst({
      where: {
        rifaId,
        ticketId: ticket.id,
      },
    });

    if (ticketAlreadyWon) {
      throw new ConflictException(
        `El ticket número ${dto.ticketNumber} ya ha ganado el premio ${ticketAlreadyWon.prizeOrder}.`,
      );
    }

    // Crear el premio
    const prize = await this.prisma.prize.create({
      data: {
        rifaId,
        ticketId: ticket.id,
        personId: ticket.personId,
        prizeOrder: dto.prizeOrder,
      },
      include: {
        ticket: true,
        person: true,
        rifa: {
          select: {
            prize_names: true,
          },
        },
      },
    });

    return prize;
  }

  /**
   * Elimina todos los premios de una rifa.
   * @param rifaId Identificador de la rifa
   * @returns Cantidad de premios eliminados
   */
  async removeAll(rifaId: number) {
    const rifaExists = await this.prisma.rifa.findUnique({
      where: { id: rifaId },
    });
    if (!rifaExists) {
      throw new NotFoundException('Rifa no encontrada.');
    }

    const result = await this.prisma.prize.deleteMany({
      where: { rifaId },
    });

    return { count: result.count };
  }
}
