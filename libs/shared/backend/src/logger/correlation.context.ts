import { AsyncLocalStorage } from 'async_hooks';

interface CorrelationContext {
  requestId: string;
  className?: string;
  methodName?: string;
}

export class CorrelationService {
  private static storage = new AsyncLocalStorage<CorrelationContext>();

  static setContext(context: CorrelationContext) {
    this.storage.enterWith(context);
  }

  static getContext(): CorrelationContext | undefined {
    return this.storage.getStore();
  }

  static getRequestId(): string | undefined {
    return this.storage.getStore()?.requestId;
  }
} 