import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CorrelationService } from '../logger/correlation.context';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Get correlation ID from headers or generate new one
    const requestId = 
      req.headers['x-correlation-id']?.toString() || 
      req.headers['x-request-id']?.toString() || 
      uuidv4();

    // Set correlation context
    CorrelationService.setContext({
      requestId,
      className: req.headers['x-source-class']?.toString(),
      methodName: req.headers['x-source-method']?.toString()
    });

    // Add correlation ID to response headers
    res.setHeader('X-Correlation-ID', requestId);
    
    next();
  }
}
