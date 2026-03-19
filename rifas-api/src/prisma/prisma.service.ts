import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Servicio Prisma que gestiona la conexión a base de datos y expone el cliente ORM.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Inicializa la conexión a base de datos cuando arranca el módulo.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Libera la conexión cuando Nest finaliza la aplicación.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
