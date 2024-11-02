import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

export interface TraceSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  metadata?: Record<string, unknown>;
  error?: Error | string;
}

export interface TraceContext {
  requestId: string;
  className: string;
  methodName: string;
  startTime: number;
  spans: TraceSpan[];
}

export class TraceService {
  private static storage = new AsyncLocalStorage<TraceContext>();

  static startTrace(context: Omit<TraceContext, 'spans'>) {
    this.storage.enterWith({
      ...context,
      spans: []
    });
  }

  static startSpan(name: string, metadata?: Record<string, unknown>): TraceSpan {
    const span: TraceSpan = {
      id: uuidv4(),
      name,
      startTime: Date.now(),
      metadata
    };

    const context = this.storage.getStore();
    if (context) {
      context.spans.push(span);
    }

    return span;
  }

  static endSpan(span: TraceSpan, metadata?: Record<string, unknown>) {
    span.endTime = Date.now();
    if (metadata) {
      span.metadata = { ...span.metadata, ...metadata };
    }
  }

  static getTrace(): TraceContext | undefined {
    return this.storage.getStore();
  }

  static setError(span: TraceSpan, error: Error | string) {
    span.error = error;
  }
} 