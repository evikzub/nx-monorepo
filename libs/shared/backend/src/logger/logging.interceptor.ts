import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { blue, white, yellow, gray, red, cyan, green } from 'chalk';
import {
  LogLevel,
  RequestLogEntry,
  ResponseLogEntry,
  ErrorLogEntry,
  ErrorResponse,
  LogType,
} from './logging.config';
import { IncomingHttpHeaders } from 'http';
import { CorrelationService } from './correlation.context';
import { TraceService } from './trace.context';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: AppConfigService) {
    this.isDevelopment = this.configService.envConfig.nodeEnv === 'development';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      type: LogType.REQUEST,
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
      requestLog,
      logPrefix
    );

    // Start trace
    TraceService.startTrace({
      requestId,
      className: controllerClass,
      methodName: handlerMethod,
      startTime: Date.now()
    });

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const responseTime = Date.now() - startTime;
          //const statusCode = ctx.getResponse<Response>().statusCode;
          const statusCode = response.statusCode;

          // Log success with structured format
          const responseLog: ResponseLogEntry = {
            type: LogType.RESPONSE,
            timestamp: new Date().toISOString(),
            level: LogLevel.INFO,
            requestId,
            className: context.getClass().name,
            method: context.getHandler().name,
            statusCode,
            responseTime,
            responseData: this.sanitizeData(data),
          };

          // Get trace information
          const trace = TraceService.getTrace();
          
          responseLog.trace = {
            totalDuration: trace?.startTime ? Date.now() - trace.startTime : 0,
            spans: trace?.spans.map(span => ({
              name: span.name,
              duration: span.endTime ? span.endTime - span.startTime : null,
              metadata: span.metadata
            })) || []
          };

          this.logger.log(
            this.formatLogMessage(method, originalUrl, ip, statusCode, responseTime),
            responseLog,
            logPrefix
          );
        },
        error: (error: Error) => {
          const responseTime = Date.now() - startTime;
          const errorResponse = this.formatErrorResponse(error);

          // Log error with structured format
          const errorLog: ErrorLogEntry = {
            type: LogType.ERROR,
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      white(url),
      statusCode && this.colorStatus(statusCode),
      responseTime && yellow(`${responseTime}ms`),
      ip && gray(ip),
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
        return green(method);
      case 'POST':
        return yellow(method);
      case 'PUT':
        return blue(method);
      case 'DELETE':
        return red(method);
      case 'PATCH':
        return cyan(method);
      default:
        return white(method);
    }
  }

  private colorStatus(status: number): string {
    if (status >= 500) {
      return red(status);
    }
    if (status >= 400) {
      return yellow(status);
    }
    if (status >= 300) {
      return cyan(status);
    }
    if (status >= 200) {
      return green(status);
    }
    return white(status);
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
