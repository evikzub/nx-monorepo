/// <reference types="jest" />

import { TestLoggerService } from './test-logger.service';

interface LogEntry {
  method: string;
  url: string;
  statusCode: number;
  requestBody?: Record<string, any>;
  responseData?: Record<string, any>;
  error?: {
    statusCode: number;
    error: string;
    message: string;
  };
}

export class LogTester {
  constructor(private testLogger: TestLoggerService) {}

  parseLogEntry(logEntry: any): LogEntry {
    const params = logEntry.params[0];
    return typeof params === 'string' ? JSON.parse(params) : params;
  }

  expectSuccessLog(options: {
    method: string;
    url: string;
    statusCode: number;
    requestBody?: Record<string, any>;
    responseData?: Record<string, any>;
  }) {
    const log = this.testLogger.logs[0];
    expect(log.message).toMatch(new RegExp(`^.*${options.method}.*${options.url}`));
    
    const logEntry = this.parseLogEntry(log);
    expect(logEntry).toMatchObject({
      method: options.method,
      url: options.url,
      statusCode: options.statusCode,
      ...(options.requestBody && { requestBody: options.requestBody }),
      ...(options.responseData && { responseData: options.responseData }),
    });
  }

  expectErrorLog(options: {
    method: string;
    url: string;
    statusCode: number;
    requestBody?: Record<string, any>;
    errorMessage?: string;
    errorType?: string;
  }) {
    const log = this.testLogger.errors[0];
    expect(log.message).toMatch(new RegExp(`^.*${options.method}.*${options.url}`));
    
    const logEntry = this.parseLogEntry(log);
    expect(logEntry).toMatchObject({
      method: options.method,
      url: options.url,
      statusCode: options.statusCode,
      ...(options.requestBody && { requestBody: options.requestBody }),
      ...(options.errorMessage && {
        error: expect.objectContaining({
          message: options.errorMessage,
          ...(options.errorType && { error: options.errorType }),
        }),
      }),
    });
  }
} 