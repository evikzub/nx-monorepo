import { AsyncLocalStorage } from 'async_hooks';

interface CorrelationContext {
  requestId: string;
  className?: string;
  methodName?: string;
  sourceService?: string;
  sourceChain?: string[];
}

export class CorrelationService {
  
  private static storage = new AsyncLocalStorage<CorrelationContext>();

  static setContext(context: CorrelationContext) {
    const sourceChain = context.sourceService 
      ? [...(context.sourceChain || []), context.sourceService]
      : [];

    this.storage.enterWith({
      ...context,
      sourceChain
    });
  }

  static getContext(): CorrelationContext | undefined {
    return this.storage.getStore();
  }

  static getRequestId(): string | undefined {
    return this.storage.getStore()?.requestId;
  }

  static getRequestChain(): string[] {
    return this.storage.getStore()?.sourceChain || [];
  }
} 