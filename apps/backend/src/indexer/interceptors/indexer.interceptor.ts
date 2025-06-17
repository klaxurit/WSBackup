import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { tap } from 'rxjs/operators';
import { INDEXER_METRICS_KEY } from '../decorators/indexer-metrics.decorator';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricsInterceptor.name);

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metricName = this.reflector.get<string>(
      INDEXER_METRICS_KEY,
      context.getHandler(),
    );

    if (!metricName) {
      return next.handle();
    }

    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;

          this.logger.log(`📊 ${metricName}: ${duration}ms`, 'Metrics');
        },
        error: (error) => {
          const duration = Date.now() - start;
          this.logger.error(`📊 ${metricName}: ${duration}ms (ERROR)`, error);
        },
      }),
    );
  }
}
