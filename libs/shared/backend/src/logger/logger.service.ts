/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import chalk from 'chalk';
//import { LogEntry } from './loging.config';

@Injectable()
export class LoggerService implements NestLoggerService {
  private getParams(optionalParams: [...any, string?]) {
    let context: string | undefined;
    let data: unknown | undefined;
  
    if (optionalParams.length === 1) {
      context = optionalParams[0];
    } else {
      data = optionalParams[0];
      context = optionalParams[1] ;
    }
    return { context, data };
  }

  log(message: string, ...optionalParams: [...any, string?]) {
    //console.log(optionalParams);
    const { context, data } = this.getParams(optionalParams);
    console.log(this.formatMessage('LOG', message, context, data, chalk.blue));
    //console.log('LOG', message, context);
  }

  error(message: string, trace?: string, context?: string, data?: unknown) {
    //console.log('ERROR: CONTEXT: ', context);
    //console.log('ERROR: DATA: ', data);
    console.error(this.formatMessage('ERROR', message, context, data, chalk.red));
    if (trace) {
      console.error(chalk.red(trace));
    }
  }

  warn(message: string, ...optionalParams: [...any, string?]) {
    const { context, data } = this.getParams(optionalParams);
    console.warn(this.formatMessage('WARN', message, context, data, chalk.yellow));
  }

  debug(message: any, ...optionalParams: [...any, string?]){
    //console.debug(optionalParams);
    const { context, data } = this.getParams(optionalParams);
    console.debug(this.formatMessage('DEBUG', message, context, data, chalk.green));
  }

  // debug(message: string, context?: string, data?: unknown) {
  //   console.debug(this.formatMessage('DEBUG', message, context, data, chalk.green));
  // }

  verbose(message: string, ...optionalParams: [...any, string?]) {
    const { context, data } = this.getParams(optionalParams);
    console.log(this.formatMessage('VERBOSE', message, context, data, chalk.cyan));
  }

  private formatMessage(
    level: string, 
    message: string, 
    context?: string, 
    data?: unknown,
    colorFn: chalk.Chalk = chalk.white
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${chalk.yellow(context)}] ` : '';
    const levelStr = this.colorLevel(level);
    const dataStr = data ? `\n ${JSON.stringify(data, null, 2)}` : '';
    
    //console.log('CONTEXT: ', contextStr);
    return `${chalk.gray(timestamp)} ${levelStr} ${contextStr} ${colorFn(message)} ${dataStr}`; 
  }

  private colorLevel(level: string): string {
    switch (level) {
      case 'LOG':
        return chalk.blue(level);
      case 'ERROR':
        return chalk.red(level);
      case 'WARN':
        return chalk.yellow(level);
      case 'DEBUG':
        return chalk.green(level);
      case 'VERBOSE':
        return chalk.cyan(level);
      default:
        return chalk.white(level);
    }
  }
} 