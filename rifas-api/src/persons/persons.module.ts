import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PersonsService } from './persons.service';
import { PersonsController } from './persons.controller';

/**
 * Módulo de personas que agrupa controlador y servicio de negocio.
 */
@Module({
  imports: [PrismaModule],
  controllers: [PersonsController],
  providers: [PersonsService],
})
export class PersonsModule {}
