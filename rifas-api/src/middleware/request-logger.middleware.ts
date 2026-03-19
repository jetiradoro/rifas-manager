import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * Middleware de registro de peticiones HTTP; anota método, ruta, IP, código y metadatos básicos.
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  /**
   * Registra la petición entrante y continúa el flujo de middleware.
   * @param req Petición HTTP entrante
   * @param res Respuesta HTTP
   * @param next Función para continuar al siguiente middleware
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const userAgent = req.get('user-agent') ?? '-';
    const requestId = req.get('x-request-id') ?? '-';

    res.on('finish', () => {
      const duration = Date.now() - start;
      this.logger.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} - ${req.ip} (${duration}ms) ` +
          `[id:${requestId}]`,
      );
    });

    next();
  }
}
