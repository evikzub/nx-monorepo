import { Logger } from '@nestjs/common';
import { LogWriter } from 'drizzle-orm';
import { CorrelationService } from './correlation.context';

export class DrizzleLogger implements LogWriter {
  private readonly logger = new Logger(); //('Drizzle');

  write(message: string) {
    const context = CorrelationService.getContext();
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'query',
      context: {
        requestId: context?.requestId,
        className: context?.className,
        methodName: context?.methodName,
      },
      query: this.parseQueryFromMessage(message),
    };

    //const logMessage = JSON.stringify(logEntry, null, 2);
    const ctxMessage = context ? `${context?.className}:${context?.methodName}` : 'Drizzle';
    if (message.includes('Error')) {
      this.logger.error("SQL ERROR: ", undefined, ctxMessage, logEntry);
    } else {
      this.logger.log("SQL LOG: ", ctxMessage, logEntry);
    }
  }

  private parseQueryFromMessage(message: string) {
    // Drizzle log messages come in format: "Query: SELECT * FROM users ... → Parameters: [1, 2, 3]"
    const [queryPart, paramsPart] = message.split('→');
    return {
      sql: queryPart?.replace('Query:', '')?.trim(),
      params: paramsPart
        ? paramsPart.replace('Parameters:', '').trim()
        : undefined,
    };
  }
}
