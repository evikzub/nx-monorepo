import { Logger } from '@nestjs/common';
import { LogWriter } from 'drizzle-orm';
import { CorrelationService } from '../correlation/correlation.context';
import { TraceService } from './trace.context';

export class DrizzleLogger implements LogWriter {
  private readonly logger = new Logger();
  
  // Sensitive fields that should be masked
  private readonly sensitiveFields = [
    'password',
    'token',
    'secret',
    'credit_card',
    'card_number',
    'api_key',
    'auth',
    'jwt',
    'session',
  ];

  // Regex patterns for sensitive data
  private readonly sensitivePatterns = [
    /password/i,
    /token/i,
    /secret/i,
    /credit[_-]?card/i,
    /card[_-]?number/i,
    /api[_-]?key/i,
  ];

  write(message: string) {
    const spanName = 'database_query';
    const parsedQuery = this.parseQueryFromMessage(message);
    
    const span = TraceService.startSpan(spanName, {
      query: this.sanitizeQuery(parsedQuery)
    });

    const context = CorrelationService.getContext();
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'query',
      context: {
        requestId: context?.requestId,
        className: context?.className,
        methodName: context?.methodName,
      },
      query: this.sanitizeQuery(parsedQuery),
    };

    const ctxMessage = context ? `${context?.className}:${context?.methodName}` : 'Drizzle';
    if (message.includes('Error')) {
      this.logger.error("SQL ERROR: ", undefined, ctxMessage, logEntry);
    } else {
      this.logger.log("SQL LOG: ", logEntry, ctxMessage);
    }

    TraceService.endSpan(span);
  }

  private parseQueryFromMessage(message: string) {
    const [queryPart, paramsPart] = message.split('→');
    return {
      sql: queryPart?.replace('Query:', '')?.trim(),
      params: paramsPart
        ? this.parseParameters(paramsPart.replace('Parameters:', '').trim())
        : undefined,
    };
  }

  private parseParameters(paramsString: string): any[] {
    try {
      return JSON.parse(paramsString);
    } catch {
      return [paramsString];
    }
  }

  private sanitizeQuery(query: { sql: string; params?: any[] }) {
    return {
      sql: this.sanitizeSql(query.sql),
      params: query.params ? this.sanitizeParams(query.sql, query.params) : undefined,
    };
  }

  private sanitizeSql(sql: string): string {
    // Remove any inline sensitive values (rare, but possible)
    return sql.replace(/'[^']*'/g, (match) => {
      if (this.sensitivePatterns.some(pattern => pattern.test(match))) {
        return "'***'";
      }
      return match;
    });
  }

  private sanitizeParams(sql: string, params: any[]): any[] {
    if (!params) return params;

    // Extract column names from SQL
    const columnMatch = sql.match(/INSERT INTO \w+ \((.*?)\) VALUES/i);
    const updateMatch = sql.match(/UPDATE \w+ SET (.*?) WHERE/i);
    
    let columns: string[] = [];
    
    if (columnMatch) {
      // Handle INSERT queries
      columns = columnMatch[1].split(',').map(col => col.trim());
    } else if (updateMatch) {
      // Handle UPDATE queries
      columns = updateMatch[1].split(',').map(col => {
        const [colName] = col.split('=');
        return colName.trim();
      });
    }

    return params.map((param, index) => {
      // Check if parameter corresponds to a sensitive column
      const column = columns[index];
      if (column && this.isSensitiveField(column)) {
        return '***';
      }

      // Check parameter value itself
      if (this.isSensitiveValue(param)) {
        return '***';
      }

      return param;
    });
  }

  private isSensitiveField(fieldName: string): boolean {
    return this.sensitiveFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }

  private isSensitiveValue(value: any): boolean {
    if (typeof value !== 'string') return false;

    // Check if the value matches common sensitive data patterns
    const sensitivePatterns = [
      /^\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/, // Credit card
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, // Password-like
      /^(?:sk|pk)_(?:test|live)_[0-9a-zA-Z]{24,}$/, // API keys
      /^eyJ[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$/, // JWT
    ];

    return sensitivePatterns.some(pattern => pattern.test(value));
  }
}
