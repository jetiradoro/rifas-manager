import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RifasService } from './rifas.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock, resetPrismaMock } from '../../test/prisma-mock';
import { createMockRifa, createMockTicket } from '../../test/test-utils';

describe('RifasService', () => {
  let service: RifasService;

  beforeEach(async () => {
    resetPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RifasService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<RifasService>(RifasService);
  });

  describe('create', () => {
    it('debería crear una rifa y generar tickets automáticamente', async () => {
      const createDto = {
        name: 'Rifa Navidad 2025',
        n_tickets: 100,
        fecha: '2025-12-31',
        n_prizes: 3,
      };
      const mockRifa = createMockRifa({
        name: createDto.name,
        n_tickets: createDto.n_tickets,
        n_prizes: createDto.n_prizes,
      });

      prismaMock.rifa.findUnique.mockResolvedValue(null);
      prismaMock.rifa.create.mockResolvedValue(mockRifa);
      prismaMock.ticket.createMany.mockResolvedValue({ count: 100 });

      const result = await service.create(createDto);

      expect(result).toEqual(mockRifa);
      expect(prismaMock.rifa.findUnique).toHaveBeenCalledWith({
        where: { name: createDto.name },
      });
      expect(prismaMock.ticket.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            number: 1,
            rifaId: mockRifa.id,
            status: 'available',
          }),
        ]),
      });
    });

    it('debería lanzar ConflictException si el nombre ya existe', async () => {
      const createDto = {
        name: 'Rifa Navidad',
        n_tickets: 100,
        fecha: '2025-12-31',
        n_prizes: 3,
      };
      const existingRifa = createMockRifa({ name: 'Rifa Navidad' });

      prismaMock.rifa.findUnique.mockResolvedValue(existingRifa);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Ya existe una rifa con ese nombre.',
      );
    });
  });

  describe('findAll', () => {
    it('debería retornar lista de rifas', async () => {
      const mockRifas = [
        createMockRifa({ id: 1, name: 'Rifa 1' }),
        createMockRifa({ id: 2, name: 'Rifa 2' }),
      ];

      prismaMock.rifa.findMany.mockResolvedValue(mockRifas);

      const result = await service.findAll();

      expect(result).toEqual(mockRifas);
      expect(prismaMock.rifa.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería retornar rifa con tickets y premios', async () => {
      const mockRifa = createMockRifa();
      const mockTicket = createMockTicket({ rifaId: 1 });
      const rifaWithRelations = {
        ...mockRifa,
        tickets: [{ ...mockTicket, person: null }],
        prizes: [],
      };

      prismaMock.rifa.findUnique.mockResolvedValue(rifaWithRelations as any);

      const result = await service.findOne(1);

      expect(result).toEqual(rifaWithRelations);
      expect(prismaMock.rifa.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
      });
    });

    it('debería retornar null si la rifa no existe', async () => {
      prismaMock.rifa.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('getSummary', () => {
    it('debería calcular correctamente tickets vendidos y disponibles', async () => {
      const mockRifa = createMockRifa({ n_tickets: 100 });
      const ticketStats = [
        { status: 'available' as const, _count: 70 },
        { status: 'reserved' as const, _count: 20 },
        { status: 'paid' as const, _count: 10 },
      ];

      prismaMock.rifa.findUnique.mockResolvedValue(mockRifa);
      prismaMock.ticket.groupBy.mockResolvedValue(ticketStats as any);

      const result = await service.getSummary(1);

      expect(result).toEqual({
        total: 100,
        sold: 30,
        available: 70,
      });
    });

    it('debería lanzar NotFoundException si la rifa no existe', async () => {
      prismaMock.rifa.findUnique.mockResolvedValue(null);

      await expect(service.getSummary(999)).rejects.toThrow(NotFoundException);
      await expect(service.getSummary(999)).rejects.toThrow(
        'Rifa no encontrada.',
      );
    });
  });

  describe('update', () => {
    it('debería actualizar campos correctamente', async () => {
      const updateDto = {
        name: 'Rifa Actualizada',
        n_prizes: 5,
      };
      const existingRifa = createMockRifa();
      const updatedRifa = createMockRifa({ ...updateDto });

      prismaMock.rifa.findUnique.mockResolvedValue(existingRifa);
      prismaMock.rifa.update.mockResolvedValue(updatedRifa);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedRifa);
      expect(prismaMock.rifa.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          name: updateDto.name,
          n_prizes: updateDto.n_prizes,
        }),
      });
    });

    it('debería lanzar NotFoundException si la rifa no existe', async () => {
      const updateDto = { name: 'Rifa Nueva' };

      prismaMock.rifa.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(999, updateDto)).rejects.toThrow(
        'Rifa no encontrada.',
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar una rifa', async () => {
      const mockRifa = createMockRifa();

      prismaMock.rifa.delete.mockResolvedValue(mockRifa);

      const result = await service.remove(1);

      expect(result).toEqual(mockRifa);
      expect(prismaMock.rifa.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
