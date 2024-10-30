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
import chalk from 'chalk';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isDevelopment = this.configService.envConfig.nodeEnv === 'development';
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

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('CONTEXT: ', context.getClass().name);
    console.log('HANDLER: ', context.getHandler().name);
    console.log('TYPE: ', context.getType());
    const ctx = context.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const startTime = Date.now();
    const { method, originalUrl, ip, body } = request;

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;
          
          const logMessage = `${this.colorMethod(method)} ${chalk.white(originalUrl)} ${
            this.colorStatus(statusCode)
          } ${chalk.yellow(`${responseTime}ms`)} - ${chalk.gray(ip)}`;

          const logData = {
            method,
            url: originalUrl,
            statusCode,
            responseTime,
            ip,
            requestBody: this.sanitizeBody(body),
            responseData: this.sanitizeData(data),
            timestamp: new Date().toISOString(),
          };

          this.logger.log(logMessage, JSON.stringify(logData, null, 2), 'HTTP');
        },
        error: (error: Error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error instanceof HttpException 
            ? error.getStatus() 
            : 500;
          
          const errorResponse = this.formatErrorResponse(error);
          
          const logMessage = `${this.colorMethod(method)} ${chalk.white(originalUrl)} ${
            this.colorStatus(statusCode)
          } ${chalk.yellow(`${responseTime}ms`)} - ${chalk.gray(ip)}`;

          const logData = {
            method,
            url: originalUrl,
            statusCode,
            responseTime,
            ip,
            error: errorResponse,
            requestBody: this.sanitizeBody(body),
            timestamp: new Date().toISOString(),
          };

          this.logger.error(logMessage, JSON.stringify(logData, null, 2), 'HTTP');
        },
      }),
    );
  }

  private formatErrorResponse(error: Error): any {
    if (error instanceof HttpException) {
      const response = error.getResponse();
      return {
        statusCode: error.getStatus(),
        error: error.name,
        message: typeof response === 'object' 
          ? (response as any).message || error.message
          : response,
        stack: this.isDevelopment ? error.stack : undefined,
        cause: error.cause,
      };
    }

    return {
      statusCode: 500,
      error: error.name,
      message: error.message,
      stack: this.isDevelopment ? error.stack : undefined,
    };
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    const sanitized = { ...body };
    if (sanitized.password) {
      sanitized.password = '***';
    }
    return sanitized;
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
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
