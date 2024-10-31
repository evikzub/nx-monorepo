import { IncomingHttpHeaders } from "http";

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export enum LogType {
  REQUEST = 'request',
  RESPONSE = 'response',
  ERROR = 'error'
}

export interface BaseLogEntry {
  timestamp: string;
  level: LogLevel;
  correlationId?: string;
  className: string;
  method: string;
}

export interface RequestLogEntry extends BaseLogEntry {
  type: LogType.REQUEST;
  requestId: string;
  url: string;
  httpMethod: string;
  ip?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestBody?: Record<string, any>;
  headers?: IncomingHttpHeaders; //Record<string, string>;
}

export interface ResponseLogEntry extends BaseLogEntry {
  type: LogType.RESPONSE;
  requestId: string;
  statusCode: number;
  responseTime: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseData?: Record<string, any>;
  trace?: {
    totalDuration: number;
    spans: {
      name: string;
      duration: number | null;
      metadata: Record<string, any> | undefined;
    }[];
  };
}

export interface ErrorResponse {
  code: string;           // Machine-readable error code (e.g., USER_NOT_FOUND)
  statusCode: number;     // HTTP status code
  error: string;         // Error type (e.g., NotFoundError)
  message: string;       // User-friendly message
  details?: unknown;     // Additional error context
  cause?: unknown;       // Original error cause
  stack?: string;        // Stack trace (development only)
}

export interface ErrorLogEntry extends BaseLogEntry {
  type: LogType.ERROR;
  requestId: string;
  error: ErrorResponse;
  url: string;
  httpMethod: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestBody?: Record<string, any>;
  responseTime: number;
}

export type LogEntry = RequestLogEntry | ResponseLogEntry | ErrorLogEntry;
