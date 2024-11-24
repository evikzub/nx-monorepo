// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import { v4 as uuidv4 } from 'uuid';

// import { CorrelationService } from '../correlation/correlation.context';
// //import { AppConfigService } from '../config/config.service';

// @Injectable()
// export class CorrelationMiddleware implements NestMiddleware {
//   //constructor(private readonly configService: AppConfigService) {}

//   use(req: Request, res: Response, next: NextFunction) {
//     // Get correlation ID from headers or generate new one
//     const requestId = 
//       req.headers['x-correlation-id']?.toString() || 
//       req.headers['x-request-id']?.toString() || 
//       uuidv4();

//     // Get source service chain from header
//     const sourceChain = req.headers['x-source-chain']?.toString()
//       ? JSON.parse(req.headers['x-source-chain'].toString())
//       : [];

//     // Set correlation context
//     CorrelationService.setContext({
//       requestId,
//       className: req.headers['x-source-class']?.toString(),
//       methodName: req.headers['x-source-method']?.toString(),
//       //sourceService: this.configService.envConfig.serviceName,
//       sourceChain
//     });

//     // Add correlation headers to response
//     res.setHeader('X-Correlation-ID', requestId);
//     res.setHeader('X-Source-Chain', JSON.stringify(CorrelationService.getRequestChain()));
    
//     next();
//   }
// }
