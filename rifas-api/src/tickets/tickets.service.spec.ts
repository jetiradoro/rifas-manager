import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock, resetPrismaMock } from '../../test/prisma-mock';
import {
  createMockRifa,
  createMockPerson,
  createMockTicket,
  createMockPrize,
} from '../../test/test-utils';

describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(async () => {
    resetPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  describe('create', () => {
    it('debería crear un ticket correctamente', async () => {
      const createDto = {
        number: 1,
        rifaId: 1,
        personId: 1,
        status: 'reserved' as const,
      };
      const mockRifa = createMockRifa();
      const mockPerson = createMockPerson();
      const mockTicket = createMockTicket(createDto);

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.ticket.findUnique.mockResolvedValue(null);
      prismaMock.person.findUnique.mockResolvedValue(mockPerson);
      prismaMock.ticket.create.mockResolvedValue(mockTicket);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTicket);
      expect(prismaMock.ticket.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('debería lanzar NotFoundException si la rifa no existe', async () => {
      const createDto = {
        number: 1,
        rifaId: 999,
        status: 'available' as const,
      };

      prismaMock.rifa.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Rifa no encontrada.',
      );
    });

    it('debería lanzar ConflictException si el número está duplicado', async () => {
      const createDto = {
        number: 1,
        rifaId: 1,
        status: 'available' as const,
      };
      const mockRifa = createMockRifa();
      const existingTicket = createMockTicket({ number: 1, rifaId: 1 });

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.ticket.findUnique.mockResolvedValue(existingTicket);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Ya existe un ticket con ese número en esta rifa.',
      );
    });

    it('debería lanzar NotFoundException si personId no existe', async () => {
      const createDto = {
        number: 1,
        rifaId: 1,
        personId: 999,
        status: 'reserved' as const,
      };
      const mockRifa = createMockRifa();

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.ticket.findUnique.mockResolvedValue(null);
      prismaMock.person.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Persona no encontrada.',
      );
    });
  });

  describe('findByRifa', () => {
    it('debería retornar tickets ordenados por número', async () => {
      const mockRifa = createMockRifa();
      const mockTickets = [
        createMockTicket({ number: 1, rifaId: 1 }),
        createMockTicket({ number: 2, rifaId: 1 }),
      ];

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.ticket.findMany.mockResolvedValue(mockTickets as any);

      const result = await service.findByRifa(1);

      expect(result).toEqual(mockTickets);
      expect(prismaMock.ticket.findMany).toHaveBeenCalledWith({
        where: { rifaId: 1 },
        include: {
          person: true,
        },
        orderBy: { number: 'asc' },
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

  describe('assignTickets', () => {
    it('debería asignar múltiples tickets a una persona', async () => {
      const assignDto = {
        ticketNumbers: [1, 2, 3],
        personId: 1,
        status: 'paid' as const,
        observations: 'Pago en efectivo',
      };
      const mockRifa = createMockRifa();
      const mockPerson = createMockPerson();
      const availableTickets = [
        createMockTicket({ number: 1, rifaId: 1 }),
        createMockTicket({ number: 2, rifaId: 1 }),
        createMockTicket({ number: 3, rifaId: 1 }),
      ];
      const assignedTickets = availableTickets.map((t) => ({
        ...t,
        personId: 1,
        status: 'paid' as const,
      }));

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.person.findUnique.mockResolvedValue(mockPerson);
      prismaMock.ticket.findMany
        .mockResolvedValueOnce(availableTickets)
        .mockResolvedValueOnce(assignedTickets as any);
      prismaMock.ticket.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.assignTickets(1, assignDto);

      expect(result).toHaveLength(3);
      expect(prismaMock.ticket.updateMany).toHaveBeenCalledWith({
        where: {
          rifaId: 1,
          number: { in: assignDto.ticketNumbers },
        },
        data: {
          personId: assignDto.personId,
          status: assignDto.status,
          observations: assignDto.observations,
        },
      });
    });

    it('debería lanzar NotFoundException si la rifa no existe', async () => {
      const assignDto = {
        ticketNumbers: [1],
        personId: 1,
        status: 'reserved' as const,
      };

      prismaMock.rifa.findUnique.mockResolvedValue(null);

      await expect(service.assignTickets(999, assignDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar NotFoundException si la persona no existe', async () => {
      const assignDto = {
        ticketNumbers: [1],
        personId: 999,
        status: 'reserved' as const,
      };
      const mockRifa = createMockRifa();

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.person.findUnique.mockResolvedValue(null);

      await expect(service.assignTickets(1, assignDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar NotFoundException si algún ticket no existe', async () => {
      const assignDto = {
        ticketNumbers: [1, 2, 999],
        personId: 1,
        status: 'reserved' as const,
      };
      const mockRifa = createMockRifa();
      const mockPerson = createMockPerson();
      const foundTickets = [
        createMockTicket({ number: 1 }),
        createMockTicket({ number: 2 }),
      ];

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.person.findUnique.mockResolvedValue(mockPerson);
      prismaMock.ticket.findMany.mockResolvedValue(foundTickets);

      await expect(service.assignTickets(1, assignDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.assignTickets(1, assignDto)).rejects.toThrow(
        'Algunos números de ticket no existen en esta rifa.',
      );
    });

    it('debería lanzar ConflictException si algún ticket ya está asignado', async () => {
      const assignDto = {
        ticketNumbers: [1, 2],
        personId: 1,
        status: 'reserved' as const,
      };
      const mockRifa = createMockRifa();
      const mockPerson = createMockPerson();
      const foundTickets = [
        createMockTicket({ number: 1 }),
        createMockTicket({ number: 2, personId: 2, status: 'paid' }),
      ];

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.person.findUnique.mockResolvedValue(mockPerson);
      prismaMock.ticket.findMany.mockResolvedValue(foundTickets as any);

      await expect(service.assignTickets(1, assignDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.assignTickets(1, assignDto)).rejects.toThrow(
        'Los tickets 2 ya están asignados.',
      );
    });
  });

  describe('update', () => {
    it('debería actualizar estado y observaciones', async () => {
      const updateDto = {
        status: 'paid' as const,
        observations: 'Pago verificado',
      };
      const existingTicket = createMockTicket();
      const updatedTicket = createMockTicket({ ...updateDto });

      prismaMock.ticket.findUnique.mockResolvedValue(existingTicket);
      prismaMock.ticket.update.mockResolvedValue(updatedTicket as any);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedTicket);
      expect(prismaMock.ticket.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        include: {
          person: true,
        },
      });
    });

    it('debería lanzar NotFoundException si el ticket no existe', async () => {
      const updateDto = { status: 'paid' as const };

      prismaMock.ticket.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar NotFoundException si nueva personId no existe', async () => {
      const updateDto = { personId: 999 };
      const existingTicket = createMockTicket();

      prismaMock.ticket.findUnique.mockResolvedValue(existingTicket);
      prismaMock.person.findUnique.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('release', () => {
    it('debería liberar un ticket correctamente', async () => {
      const existingTicket = createMockTicket({
        personId: 1,
        status: 'reserved',
      });
      const releasedTicket = createMockTicket({
        personId: null,
        status: 'available',
      });

      prismaMock.ticket.findUnique.mockResolvedValue({
        ...existingTicket,
        prizes: [],
      } as any);
      prismaMock.ticket.update.mockResolvedValue(releasedTicket);

      const result = await service.release(1);

      expect(result).toEqual(releasedTicket);
      expect(prismaMock.ticket.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          personId: null,
          status: 'available',
          observations: null,
        },
      });
    });

    it('debería lanzar NotFoundException si el ticket no existe', async () => {
      prismaMock.ticket.findUnique.mockResolvedValue(null);

      await expect(service.release(999)).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ConflictException si el ticket fue premiado', async () => {
      const existingTicket = createMockTicket({ personId: 1 });
      const mockPrize = createMockPrize({ ticketId: 1 });

      prismaMock.ticket.findUnique.mockResolvedValue({
        ...existingTicket,
        prizes: [mockPrize],
      } as any);

      await expect(service.release(1)).rejects.toThrow(ConflictException);
      await expect(service.release(1)).rejects.toThrow(
        'No se puede liberar un ticket que ha sido premiado.',
      );
    });
  });
});
