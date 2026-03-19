import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs';

/**
 * Interceptor global que formatea todas las fechas en las respuestas a
 * 'YYYY-MM-DD HH:mm:ss'.
 */
@Injectable()
export class DateFormatInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.formatDates(data)));
  }

  private formatDates(value: any): any {
    if (value instanceof Date) {
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.formatDates(item));
    }

    if (value && typeof value === 'object') {
      const formatted: Record<string, any> = {};
      Object.keys(value).forEach((key) => {
        formatted[key] = this.formatDates(value[key]);
      });
      return formatted;
    }

    return value;
  }
}
