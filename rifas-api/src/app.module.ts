import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { RobotsMiddleware } from './common/middleware/robots.middleware';
import { RifasModule } from './rifas/rifas.module';
import { PersonsModule } from './persons/persons.module';
import { TicketsModule } from './tickets/tickets.module';
import { PrizesModule } from './prizes/prizes.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ApiTokenGuard } from './guards/api-token.guard';

/**
 * Módulo raíz de la API y punto de entrada para configuración global.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    AuthModule,
    UsersModule,
    RifasModule,
    PersonsModule,
    TicketsModule,
    PrizesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ApiTokenGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  /**
   * Registra middleware global para registrar todas las peticiones HTTP
   * y añadir headers anti-indexación.
   * @param consumer Constructor de la cadena de middlewares
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware, RobotsMiddleware).forRoutes('*');
  }
}
