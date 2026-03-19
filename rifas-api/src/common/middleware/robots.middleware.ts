import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para prevenir indexación por robots de búsqueda.
 * Añade el header X-Robots-Tag: noindex, nofollow a todas las respuestas.
 */
@Injectable()
export class RobotsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  }
}
