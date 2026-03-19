import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RifasService } from './rifas.service';
import { RifasController } from './rifas.controller';
import { TicketsModule } from '../tickets/tickets.module';

/**
 * Módulo de rifas que agrupa controlador y servicio de negocio.
 */
@Module({
  imports: [PrismaModule, TicketsModule],
  controllers: [RifasController],
  providers: [RifasService],
})
export class RifasModule {}
