import { Injectable, Logger } from '@nestjs/common';
import { delay } from 'rxjs';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);
  
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_DELAY = 1000; // 1 second

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    serviceId: string,
    attempt = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.MAX_RETRIES) {
        this.logger.error(
          `Failed after ${attempt} attempts for service: ${serviceId}`,
          error
        );
        throw error;
      }

      const delayMs = this.calculateDelay(attempt);
      this.logger.warn(
        `Retry attempt ${attempt} for service: ${serviceId} after ${delayMs}ms`
      );
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return this.executeWithRetry(operation, serviceId, attempt + 1);
    }
  }

  private calculateDelay(attempt: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = this.INITIAL_DELAY * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 100;
    return exponentialDelay + jitter;
  }
} 