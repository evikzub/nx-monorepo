/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoggerService as NestLoggerService } from '@nestjs/common';

export class TestLoggerService implements NestLoggerService {
  logs: any[] = [];
  errors: any[] = [];
  warns: any[] = [];
  debugs: any[] = [];
  verboses: any[] = [];

  log(message: any, ...optionalParams: any[]) {
    this.logs.push({ message, params: optionalParams });
  }

  error(message: any, ...optionalParams: any[]) {
    this.errors.push({ message, params: optionalParams });
  }

  warn(message: any, ...optionalParams: any[]) {
    this.warns.push({ message, params: optionalParams });
  }

  debug(message: any, ...optionalParams: any[]) {
    this.debugs.push({ message, params: optionalParams });
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.verboses.push({ message, params: optionalParams });
  }

  clear() {
    this.logs = [];
    this.errors = [];
    this.warns = [];
    this.debugs = [];
    this.verboses = [];
  }
} 