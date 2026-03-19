import { Injectable } from '@nestjs/common';

/**
 * Servicio base de la aplicación para exponer información general.
 */
@Injectable()
export class AppService {
  /**
   * Genera un saludo simple para comprobar la disponibilidad del servicio.
   * @returns Cadena de saludo
   */
  getHello(): string {
    return 'Hello World!';
  }
}
