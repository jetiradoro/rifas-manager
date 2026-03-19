import { Rifa, Person, Ticket, Prize } from '@prisma/client';

/**
 * Crea un mock de Rifa para tests.
 */
export function createMockRifa(overrides?: Partial<Rifa>): Rifa {
  return {
    id: 1,
    name: 'Rifa Test',
    n_tickets: 100,
    fecha: new Date('2025-12-31'),
    n_prizes: 3,
    ...overrides,
  };
}

/**
 * Crea un mock de Person para tests.
 */
export function createMockPerson(overrides?: Partial<Person>): Person {
  return {
    id: 1,
    name: 'Juan',
    surname: 'Pérez',
    phone: '123456789',
    email: 'juan@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Crea un mock de Ticket para tests.
 */
export function createMockTicket(overrides?: Partial<Ticket>): Ticket {
  return {
    id: 1,
    number: 1,
    rifaId: 1,
    personId: null,
    status: 'available',
    observations: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Crea un mock de Prize para tests.
 */
export function createMockPrize(overrides?: Partial<Prize>): Prize {
  return {
    id: 1,
    rifaId: 1,
    ticketId: 1,
    personId: 1,
    prizeOrder: 1,
    drawnAt: new Date(),
    ...overrides,
  };
}
