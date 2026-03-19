import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock, resetPrismaMock } from '../../test/prisma-mock';
import { createMockPerson, createMockTicket } from '../../test/test-utils';

describe('PersonsService', () => {
  let service: PersonsService;

  beforeEach(async () => {
    resetPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PersonsService>(PersonsService);
  });

  describe('create', () => {
    it('debería crear una persona correctamente', async () => {
      const createDto = {
        name: 'Juan',
        surname: 'Pérez',
        phone: '123456789',
        email: 'juan@example.com',
      };
      const mockPerson = createMockPerson(createDto);

      prismaMock.person.findUnique.mockResolvedValue(null);
      prismaMock.person.create.mockResolvedValue(mockPerson);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPerson);
      expect(prismaMock.person.findUnique).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(prismaMock.person.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      const createDto = {
        name: 'Juan',
        surname: 'Pérez',
        phone: '123456789',
        email: 'juan@example.com',
      };
      const existingPerson = createMockPerson();

      prismaMock.person.findUnique.mockResolvedValue(existingPerson);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Ya existe una persona con ese email.',
      );
    });
  });

  describe('findAll', () => {
    it('debería retornar lista ordenada por nombre y apellido', async () => {
      const mockPersons = [
        createMockPerson({ id: 1, name: 'Ana', surname: 'García' }),
        createMockPerson({ id: 2, name: 'Juan', surname: 'Pérez' }),
      ];

      prismaMock.person.findMany.mockResolvedValue(mockPersons);

      const result = await service.findAll();

      expect(result).toEqual(mockPersons);
      expect(prismaMock.person.findMany).toHaveBeenCalledWith({
        orderBy: [{ name: 'asc' }, { surname: 'asc' }],
      });
    });
  });

  describe('findOne', () => {
    it('debería retornar persona con tickets relacionados', async () => {
      const mockPerson = createMockPerson();
      const mockTicket = createMockTicket({ personId: 1 });
      const personWithTickets = {
        ...mockPerson,
        tickets: [{ ...mockTicket, rifa: { id: 1, name: 'Rifa Test' } }],
      };

      prismaMock.person.findUnique.mockResolvedValue(personWithTickets as any);

      const result = await service.findOne(1);

      expect(result).toEqual(personWithTickets);
      expect(prismaMock.person.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          tickets: {
            include: {
              rifa: true,
            },
          },
        },
      });
    });

    it('debería retornar null si la persona no existe', async () => {
      prismaMock.person.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debería actualizar campos correctamente', async () => {
      const updateDto = {
        name: 'Juan Actualizado',
        phone: '987654321',
      };
      const existingPerson = createMockPerson();
      const updatedPerson = createMockPerson({ ...updateDto });

      prismaMock.person.findUnique.mockResolvedValue(existingPerson);
      prismaMock.person.update.mockResolvedValue(updatedPerson);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedPerson);
      expect(prismaMock.person.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('debería lanzar NotFoundException si la persona no existe', async () => {
      const updateDto = { name: 'Juan' };

      prismaMock.person.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(999, updateDto)).rejects.toThrow(
        'Persona no encontrada.',
      );
    });

    it('debería lanzar ConflictException si el nuevo email ya existe', async () => {
      const updateDto = { email: 'otro@example.com' };
      const existingPerson = createMockPerson({
        id: 1,
        email: 'juan@example.com',
      });
      const otherPerson = createMockPerson({
        id: 2,
        email: 'otro@example.com',
      });

      prismaMock.person.findUnique
        .mockResolvedValueOnce(existingPerson)
        .mockResolvedValueOnce(otherPerson);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar una persona sin tickets', async () => {
      const mockPerson = createMockPerson();
      const personWithoutTickets = { ...mockPerson, tickets: [] };

      prismaMock.person.findUnique.mockResolvedValue(
        personWithoutTickets as any,
      );
      prismaMock.person.delete.mockResolvedValue(mockPerson);

      const result = await service.remove(1);

      expect(result).toEqual(mockPerson);
      expect(prismaMock.person.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('debería lanzar NotFoundException si la persona no existe', async () => {
      prismaMock.person.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow(
        'Persona no encontrada.',
      );
    });

    it('debería lanzar ConflictException si la persona tiene tickets', async () => {
      const mockPerson = createMockPerson();
      const mockTicket = createMockTicket({ personId: 1 });
      const personWithTickets = {
        ...mockPerson,
        tickets: [mockTicket],
      };

      prismaMock.person.findUnique.mockResolvedValue(personWithTickets as any);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      await expect(service.remove(1)).rejects.toThrow(
        'No se puede eliminar una persona con tickets asociados.',
      );
    });
  });
});
