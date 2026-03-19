import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrizesService } from './prizes.service';
import { PrizesController } from './prizes.controller';

/**
 * Módulo de premios que agrupa controlador y servicio de negocio.
 */
@Module({
  imports: [PrismaModule],
  controllers: [PrizesController],
  providers: [PrizesService],
})
export class PrizesModule {}
