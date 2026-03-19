import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

/**
 * Mock profundo del PrismaClient para tests unitarios.
 */
export const prismaMock =
  mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

/**
 * Resetea todos los mocks de Prisma entre tests.
 */
export function resetPrismaMock() {
  mockReset(prismaMock);
}
