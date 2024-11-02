export interface IRetryService {
  executeWithRetry<T>(
    operation: () => Promise<T>,
    serviceName: string,
    options?: RetryOptions
  ): Promise<T>;
}

export interface RetryOptions {
  maxAttempts: number;
  backoffMs: number;
  maxBackoffMs: number;
  timeout: number;
  retryableErrors?: string[];
}

export interface RetryContext {
  attempt: number;
  error: Error;
  startTime: Date;
  nextRetryDelay: number;
} 