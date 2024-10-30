import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import chalk from 'chalk';

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: string, context?: string) {
    console.log('LOG: MESSAGE: ', message);
    console.log('LOG: CONTEXT: ', context);
    console.log(this.formatMessage('LOG', message, context, chalk.blue));
  }

  error(message: string, trace?: string, context?: string) {
    console.error(this.formatMessage('ERROR', message, context, chalk.red));
    if (trace) {
      console.error(chalk.red(trace));
    }
  }

  warn(message: string, context?: string) {
    console.warn(this.formatMessage('WARN', message, context, chalk.yellow));
  }

  debug(message: string, context?: string) {
    console.debug(this.formatMessage('DEBUG', message, context, chalk.green));
  }

  verbose(message: string, context?: string) {
    console.log(this.formatMessage('VERBOSE', message, context, chalk.cyan));
  }

  private formatMessage(
    level: string, 
    message: string, 
    context?: string, 
    colorFn: chalk.Chalk = chalk.white
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${chalk.yellow(context)}] ` : '';
    const levelStr = this.colorLevel(level);
    
    //console.log('CONTEXT: ', contextStr);
    return `${chalk.gray(timestamp)} ${levelStr} ${colorFn(message)} \n ${contextStr}`;
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