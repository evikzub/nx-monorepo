import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';
import {
  LogLevel,
  RequestLogEntry,
  ResponseLogEntry,
  ErrorLogEntry,
  ErrorResponse,
} from './logging.config';
import { IncomingHttpHeaders } from 'http';
import { CorrelationService } from './correlation.context';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isDevelopment = this.configService.envConfig.nodeEnv === 'development';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const startTime = Date.now();
    const requestId = uuidv4();
    const { method, originalUrl, ip, body, headers } = request;

    // Get controller and handler names
    const controllerClass = context.getClass().name;
    const handlerMethod = context.getHandler().name;

    // Set correlation context
    CorrelationService.setContext({
      requestId,
      className: controllerClass,
      methodName: handlerMethod,
    });

    // Format initial log message
    const logPrefix = `${controllerClass}:${handlerMethod}`;
    
    const requestLog: RequestLogEntry = {
      type: 'request',
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      requestId,
      className: context.getClass().name,
      method: context.getHandler().name,
      url: originalUrl,
      httpMethod: method,
      ip,
      requestBody: this.sanitizeBody(body),
      headers: this.sanitizeHeaders(headers),
    };

    this.logger.log(
      this.formatLogMessage(method, originalUrl, ip), 
      logPrefix,
      requestLog
    );

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const responseTime = Date.now() - startTime;
          //const statusCode = ctx.getResponse<Response>().statusCode;
          const statusCode = response.statusCode;

          // Log success with structured format
          const responseLog: ResponseLogEntry = {
            type: 'response',
            timestamp: new Date().toISOString(),
            level: LogLevel.INFO,
            requestId,
            className: context.getClass().name,
            method: context.getHandler().name,
            statusCode,
            responseTime,
            responseData: this.sanitizeData(data),
          };

          this.logger.log(
            this.formatLogMessage(method, originalUrl, ip, statusCode, responseTime),
            logPrefix,
            responseLog
          );
        },
        error: (error: Error) => {
          const responseTime = Date.now() - startTime;
          const errorResponse = this.formatErrorResponse(error);

          // Log error with structured format
          const errorLog: ErrorLogEntry = {
            type: 'error',
            timestamp: new Date().toISOString(),
            level: LogLevel.ERROR,
            requestId,
            className: context.getClass().name,
            method: context.getHandler().name,
            url: originalUrl,
            httpMethod: method,
            responseTime,
            error: errorResponse,
            requestBody: this.sanitizeBody(body),
          };

          this.logger.error(
            this.formatLogMessage(method, originalUrl, ip, errorResponse.statusCode, responseTime),
            this.isDevelopment ? error.stack : undefined,
            logPrefix,
            errorLog
          );
        },
      })
    );
  }

  private formatErrorResponse(error: Error): ErrorResponse {
    if (error instanceof HttpException) {
      const response = error.getResponse();
      return {
        code: this.getErrorCode(error),
        statusCode: error.getStatus(),
        error: error.name,
        message: typeof response === 'object' 
          ? (response as any).message || error.message
          : response,
        details: typeof response === 'object' ? response : undefined,
        cause: error.cause,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    return {
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
      error: error.name,
      message: error.message,
      stack: this.isDevelopment ? error.stack : undefined,
    };
  }

  private getErrorCode(error: HttpException): string {
    // Map HTTP exceptions to error codes
    const statusCode = error.getStatus();
    switch (statusCode) {
      case 400: return 'BAD_REQUEST';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 422: return 'UNPROCESSABLE_ENTITY';
      default: return `HTTP_${statusCode}`;
    }
  }

  private formatLogMessage(
    method: string,
    url: string,
    ip?: string,
    statusCode?: number,
    responseTime?: number
  ): string {
    return [
      this.colorMethod(method),
      chalk.white(url),
      statusCode && this.colorStatus(statusCode),
      responseTime && chalk.yellow(`${responseTime}ms`),
      ip && chalk.gray(ip),
    ].filter(Boolean).join(' ');
  }

  private sanitizeHeaders(headers: IncomingHttpHeaders): IncomingHttpHeaders {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    return Object.entries(headers).reduce((acc, [key, value]) => {
      acc[key] = sensitiveHeaders.includes(key.toLowerCase()) ? '***' : value;
      return acc;
    }, {} as IncomingHttpHeaders);//Record<string, any>);
  }

  private colorMethod(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET':
        return chalk.green(method);
      case 'POST':
        return chalk.yellow(method);
      case 'PUT':
        return chalk.blue(method);
      case 'DELETE':
        return chalk.red(method);
      case 'PATCH':
        return chalk.cyan(method);
      default:
        return chalk.white(method);
    }
  }

  private colorStatus(status: number): string {
    if (status >= 500) {
      return chalk.red(status);
    }
    if (status >= 400) {
      return chalk.yellow(status);
    }
    if (status >= 300) {
      return chalk.cyan(status);
    }
    if (status >= 200) {
      return chalk.green(status);
    }
    return chalk.white(status);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sanitizeBody(body: any): any {
    if (!body) return body;
    const sanitized = { ...body };
    if (sanitized.password) {
      sanitized.password = '***';
    }
    return sanitized;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sanitizeData(data: any): any {
    if (!data) return data;
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }
    if (typeof data === 'object') {
      const sanitized = { ...data };
      if (sanitized.password) {
        sanitized.password = '***';
      }
      return sanitized;
    }
    return data;
  }
}
