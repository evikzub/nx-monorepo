export interface IMetricsCollector {
  incrementCounter(name: string, tags?: Record<string, string>): void;
  recordTiming(name: string, value: number, tags?: Record<string, string>): void;
  recordGauge(name: string, value: number, tags?: Record<string, string>): void;
}

export interface ILogger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
  correlationId?: string;
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'; 