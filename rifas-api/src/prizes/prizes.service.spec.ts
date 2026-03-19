import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock, resetPrismaMock } from '../../test/prisma-mock';
import {
  createMockRifa,
  createMockPerson,
  createMockTicket,
  createMockPrize,
} from '../../test/test-utils';

describe('PrizesService', () => {
  let service: PrizesService;

  beforeEach(async () => {
    resetPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrizesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PrizesService>(PrizesService);
  });

  describe('findByRifa', () => {
    it('debería retornar premios ordenados por prizeOrder', async () => {
      const mockRifa = createMockRifa();
      const mockTicket = createMockTicket();
      const mockPerson = createMockPerson();
      const mockPrizes = [
        createMockPrize({ prizeOrder: 1 }),
        createMockPrize({ prizeOrder: 2 }),
        createMockPrize({ prizeOrder: 3 }),
      ];

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.prize.findMany.mockResolvedValue(
        mockPrizes.map((p) => ({
          ...p,
          ticket: mockTicket,
          person: mockPerson,
        })) as any,
      );

      const result = await service.findByRifa(1);

      expect(result).toHaveLength(3);
      expect(prismaMock.prize.findMany).toHaveBeenCalledWith({
        where: { rifaId: 1 },
        include: {
          ticket: true,
          person: true,
        },
        orderBy: { prizeOrder: 'asc' },
      });
    });

    it('debería lanzar NotFoundException si la rifa no existe', async () => {
      prismaMock.rifa.findUnique.mockResolvedValue(null);

      await expect(service.findByRifa(999)).rejects.toThrow(NotFoundException);
      await expect(service.findByRifa(999)).rejects.toThrow(
        'Rifa no encontrada.',
      );
    });
  });

  describe('draw', () => {
    it('debería ejecutar sorteo correctamente con n premios', async () => {
      const mockRifa = createMockRifa({ n_prizes: 3 });
      const soldTickets = [
        createMockTicket({
          id: 1,
          number: 1,
          personId: 1,
          status: 'paid',
        }),
        createMockTicket({
          id: 2,
          number: 2,
          personId: 2,
          status: 'paid',
        }),
        createMockTicket({
          id: 3,
          number: 3,
          personId: 3,
          status: 'reserved',
        }),
        createMockTicket({
          id: 4,
          number: 4,
          personId: 4,
          status: 'paid',
        }),
      ];

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.prize.findMany.mockResolvedValue([]);
      prismaMock.ticket.findMany.mockResolvedValue(soldTickets as any);
      prismaMock.prize.create.mockImplementation((args: any) => {
        return Promise.resolve({
          ...createMockPrize(),
          ...args.data,
          ticket: createMockTicket(),
          person: createMockPerson(),
        });
      });

      const result = await service.draw(1);

      expect(result).toHaveLength(3);
      expect(prismaMock.prize.create).toHaveBeenCalledTimes(3);
      expect(prismaMock.ticket.findMany).toHaveBeenCalledWith({
        where: {
          rifaId: 1,
          status: { in: ['reserved', 'paid'] },
          personId: { not: null },
        },
      });
    });

    it('debería lanzar NotFoundException si la rifa no existe', async () => {
      prismaMock.rifa.findUnique.mockResolvedValue(null);

      await expect(service.draw(999)).rejects.toThrow(NotFoundException);
      await expect(service.draw(999)).rejects.toThrow('Rifa no encontrada.');
    });

    it('debería lanzar ConflictException si ya existen premios', async () => {
      const mockRifa = createMockRifa();
      const existingPrizes = [createMockPrize()];

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.prize.findMany.mockResolvedValue(existingPrizes);

      await expect(service.draw(1)).rejects.toThrow(ConflictException);
      await expect(service.draw(1)).rejects.toThrow(
        'Ya existen premios para esta rifa. Elimínalos antes de realizar un nuevo sorteo.',
      );
    });

    it('debería lanzar BadRequestException si no hay suficientes tickets', async () => {
      const mockRifa = createMockRifa({ n_prizes: 5 });
      const soldTickets = [
        createMockTicket({ personId: 1, status: 'paid' }),
        createMockTicket({ personId: 2, status: 'reserved' }),
      ];

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.prize.findMany.mockResolvedValue([]);
      prismaMock.ticket.findMany.mockResolvedValue(soldTickets as any);

      await expect(service.draw(1)).rejects.toThrow(BadRequestException);
      await expect(service.draw(1)).rejects.toThrow(
        'No hay suficientes tickets vendidos. Se necesitan al menos 5 tickets vendidos para realizar el sorteo.',
      );
    });

    it('debería seleccionar solo tickets vendidos (reserved/paid)', async () => {
      const mockRifa = createMockRifa({ n_prizes: 2 });
      const soldTickets = [
        createMockTicket({
          id: 1,
          personId: 1,
          status: 'paid',
        }),
        createMockTicket({
          id: 2,
          personId: 2,
          status: 'reserved',
        }),
      ];

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.prize.findMany.mockResolvedValue([]);
      prismaMock.ticket.findMany.mockResolvedValue(soldTickets as any);
      prismaMock.prize.create.mockImplementation((args: any) => {
        return Promise.resolve({
          ...createMockPrize(),
          ...args.data,
          ticket: createMockTicket(),
          person: createMockPerson(),
        });
      });

      await service.draw(1);

      expect(prismaMock.ticket.findMany).toHaveBeenCalledWith({
        where: {
          rifaId: 1,
          status: { in: ['reserved', 'paid'] },
          personId: { not: null },
        },
      });
    });
  });

  describe('remove', () => {
    it('debería eliminar premio específico', async () => {
      const mockPrize = createMockPrize();

      prismaMock.prize.findUnique.mockResolvedValue(mockPrize);
      prismaMock.prize.delete.mockResolvedValue(mockPrize);

      const result = await service.remove(1);

      expect(result).toEqual(mockPrize);
      expect(prismaMock.prize.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('debería lanzar NotFoundException si el premio no existe', async () => {
      prismaMock.prize.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'Premio no encontrado.',
      );
    });
  });

  describe('removeAll', () => {
    it('debería eliminar todos los premios de una rifa', async () => {
      const mockRifa = createMockRifa();

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.prize.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.removeAll(1);

      expect(result).toEqual({ count: 3 });
      expect(prismaMock.prize.deleteMany).toHaveBeenCalledWith({
        where: { rifaId: 1 },
      });
    });

    it('debería lanzar NotFoundException si la rifa no existe', async () => {
      prismaMock.rifa.findUnique.mockResolvedValue(null);

      await expect(service.removeAll(999)).rejects.toThrow(NotFoundException);
      await expect(service.removeAll(999)).rejects.toThrow(
        'Rifa no encontrada.',
      );
    });
  });
});
