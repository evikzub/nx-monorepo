/// <reference types="jest" />

import { BaseLogEntry } from '../logger/logging.config';
import { TestLoggerService } from './test-logger.service';

type LogEntry = {
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any[];
};

export class LogTester {
  constructor(private testLogger: TestLoggerService) {}

  parseLogEntry(logEntry: LogEntry, isError = false): BaseLogEntry {
    const params = isError ? logEntry.params[2] : logEntry.params[1];
    return typeof params === 'string' ? JSON.parse(params) : params;
  }

  expectSuccessLog(options: {
    method: string;
    url: string;
    statusCode: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requestBody?: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responseData?: Record<string, any>;
  }) {
    expect(this.testLogger.logs.length).toBe(2);

    // getting the request log
    const requestLog = this.testLogger.logs[0];
    expect(requestLog.message).toMatch(
      new RegExp(`^.*${options.method}.*${options.url}`)
    );
    //console.log('REQUEST LOG: ', this.testLogger.logs[0].params);
    const requestLogEntry = this.parseLogEntry(requestLog);
    expect(requestLogEntry).toMatchObject({
      httpMethod: options.method,
      url: options.url,
      ...(options.requestBody && { requestBody: options.requestBody }),
    });

    // getting the response log
    const responseLog = this.testLogger.logs[1];
    //console.log('RESPONSE LOG: ', responseLog);
    //console.log('RESPONSE LOG DATA: ', responseLog.params[1].responseData);
    expect(responseLog.message).toMatch(
      new RegExp(`^.*${options.method}.*${options.url}`)
    );

    const responseLogEntry = this.parseLogEntry(responseLog);
    expect(responseLogEntry).toMatchObject({
      statusCode: options.statusCode,
      ...(options.responseData && { responseData: options.responseData }),
    });
  }

  expectErrorLog(options: {
    method: string;
    url: string;
    statusCode: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requestBody?: Record<string, any>;
    errorMessage?: string;
    errorType?: string;
  }) {
    expect(this.testLogger.logs.length).toBe(1);
    const log = this.testLogger.errors[0];
    //console.log('LOG: ', log);
    expect(log.message).toMatch(
      new RegExp(`^.*${options.method}.*${options.url}`)
    );

    const logEntry = this.parseLogEntry(log, true);
    //console.log('LOG ENTRY: ', logEntry);
    expect(logEntry).toMatchObject({
      httpMethod: options.method,
      url: options.url,
      ...(options.statusCode && { error: { statusCode: options.statusCode } }),
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
