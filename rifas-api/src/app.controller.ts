import { Public } from './auth/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controlador raíz de ejemplo para la API.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Devuelve el mensaje de bienvenida de la API.
   * @returns Cadena de saludo
   */
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
