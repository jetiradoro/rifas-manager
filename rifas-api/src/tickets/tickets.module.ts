import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';

/**
 * Módulo de tickets que agrupa controlador y servicio de negocio.
 */
@Module({
  imports: [PrismaModule],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
