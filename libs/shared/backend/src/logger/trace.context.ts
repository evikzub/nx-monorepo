import { AsyncLocalStorage } from "async_hooks";

interface TraceSpan {
  name: string;
  startTime: number;
  endTime?: number;
  metadata?: Record<string, any>;
}

interface TraceContext {
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

  static startSpan(name: string, metadata?: Record<string, any>): string {
    const context = this.storage.getStore();
    if (!context) return '';

    const span: TraceSpan = {
      name,
      startTime: Date.now(),
      metadata
    };
    context.spans.push(span);
    return name;
  }

  static endSpan(name: string) {
    const context = this.storage.getStore();
    if (!context) return;

    const span = context.spans.find(s => s.name === name && !s.endTime);
    if (span) {
      span.endTime = Date.now();
    }
  }

  static getTrace(): TraceContext | undefined {
    return this.storage.getStore();
  }
} 