import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorMiddleware implements NestMiddleware {
  private readonly logger = new Logger('ErrorMiddleware');

  use(req: Request, res: Response, next: NextFunction) {
    const cleanup = () => {
      res.removeListener('finish', logResponse);
      res.removeListener('error', logError);
    };

    const logResponse = () => {
      cleanup();
      if (res.statusCode >= 400) {
        this.logger.error(`HTTP ${res.statusCode} ${req.method} ${req.url}`);
      }
    };

    const logError = (err: Error) => {
      cleanup();
      this.logger.error(`Request error: ${err.message}`);
    };

    res.on('finish', logResponse);
    res.on('error', logError);
    next();
  }
} 