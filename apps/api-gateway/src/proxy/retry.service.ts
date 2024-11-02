import { Injectable, Logger } from '@nestjs/common';
import { 
  IRetryService, 
  RetryOptions, 
  RetryContext 
} from '../interfaces/retry.interface';

@Injectable()
export class RetryService implements IRetryService {
  private readonly logger = new Logger(RetryService.name);
  private readonly defaultOptions: RetryOptions = {
    maxAttempts: 3,
    backoffMs: 1000,
    maxBackoffMs: 10000,
    timeout: 30000,
    retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET'],
  };

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    serviceName: string,
    options?: Partial<RetryOptions>
  ): Promise<T> {
    const retryOptions = { ...this.defaultOptions, ...options };
    const startTime = new Date();
    let attempt = 1;

    while (attempt <= retryOptions.maxAttempts) {
      try {
        const result = await operation();
        if (attempt > 1) {
          this.logger.log(
            `Operation succeeded for ${serviceName} after ${attempt} attempts`
          );
        }
        return result;
      } catch (error) {
        const context: RetryContext = {
          attempt,
          error,
          startTime,
          nextRetryDelay: this.calculateBackoff(attempt, retryOptions),
        };

        if (!this.shouldRetry(error, context, retryOptions)) {
          throw error;
        }

        this.logger.warn(
          `Retry attempt ${attempt}/${retryOptions.maxAttempts} for ${serviceName}`,
          { error: error.message, delay: context.nextRetryDelay }
        );

        await this.delay(context.nextRetryDelay);
        attempt++;
      }
    }

    throw new Error(`Max retry attempts (${retryOptions.maxAttempts}) reached`);
  }

  private shouldRetry(
    error: any, 
    context: RetryContext, 
    options: RetryOptions
  ): boolean {
    // Check if we've exceeded max attempts
    if (context.attempt >= options.maxAttempts) {
      return false;
    }

    // Check if we've exceeded timeout
    const elapsed = new Date().getTime() - context.startTime.getTime();
    if (elapsed >= options.timeout) {
      return false;
    }

    // Check if error is retryable
    if (options.retryableErrors && error.code) {
      return options.retryableErrors.includes(error.code);
    }

    return true;
  }

  private calculateBackoff(attempt: number, options: RetryOptions): number {
    const backoff = options.backoffMs * Math.pow(2, attempt - 1);
    return Math.min(backoff, options.maxBackoffMs);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 