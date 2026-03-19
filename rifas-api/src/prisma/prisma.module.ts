import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo que provee el cliente de Prisma para ser inyectado en otros módulos.
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
