import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IndexerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IndexerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { method, url } = req;
      const { statusCode } = res;

      this.logger.log(`${method} ${url} ${statusCode} - ${duration}ms`, 'HTTP');
    });

    next();
  }
}
