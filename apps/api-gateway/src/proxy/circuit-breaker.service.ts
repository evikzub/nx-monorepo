import { Injectable, Logger } from '@nestjs/common';
import { 
  ICircuitBreakerService, 
  CircuitBreakerState, 
} from '../interfaces/circuit-breaker.interface';

@Injectable()
export class CircuitBreakerService implements ICircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly states = new Map<string, CircuitBreakerState>();
  
  private readonly FAILURE_THRESHOLD = 5;
  private readonly RESET_TIMEOUT = 60000; // 60 seconds

  getState(serviceName: string): CircuitBreakerState {
    return this.getOrCreateState(serviceName);
  }

  isOpen(serviceName: string): boolean {
    const state = this.getOrCreateState(serviceName);
    
    if (state.status === 'OPEN') {
      const now = Date.now();
      if (state.lastFailure && (now - state.lastFailure) > this.RESET_TIMEOUT) {
        this.transitionToHalfOpen(serviceName);
        return false;
      }
      return true;
    }
    
    return false;
  }

  recordSuccess(serviceName: string): void {
    const state = this.getOrCreateState(serviceName);
    
    if (state.status === 'HALF_OPEN') {
      this.transitionToClosed(serviceName);
    }
  }

  recordFailure(serviceName: string): void {
    const state = this.getOrCreateState(serviceName);
    
    if (state.status === 'HALF_OPEN') {
      this.transitionToOpen(serviceName);
      return;
    }

    if (state.status === 'CLOSED') {
      state.failures++;
      state.lastFailure = Date.now();

      if (state.failures >= this.FAILURE_THRESHOLD) {
        this.transitionToOpen(serviceName);
      }
    }
  }

  reset(serviceName: string): void {
    this.states.set(serviceName, this.createInitialState());
    this.logger.debug(`Circuit breaker for ${serviceName} reset to initial state`);
  }

  private getOrCreateState(serviceName: string): CircuitBreakerState {
    if (!this.states.has(serviceName)) {
      this.states.set(serviceName, this.createInitialState());
    }
    return this.states.get(serviceName)!;
  }

  private createInitialState(): CircuitBreakerState {
    return {
      failures: 0,
      lastFailure: null,
      status: 'CLOSED'
    };
  }

  private transitionToOpen(serviceName: string): void {
    const state = this.getOrCreateState(serviceName);
    state.status = 'OPEN';
    state.lastFailure = Date.now();
    this.logger.warn(
      `Circuit breaker for ${serviceName} opened after ${state.failures} failures`
    );
  }

  private transitionToHalfOpen(serviceName: string): void {
    const state = this.getOrCreateState(serviceName);
    state.status = 'HALF_OPEN';
    state.failures = 0;
    this.logger.debug(`Circuit breaker for ${serviceName} moved to HALF_OPEN state`);
  }

  private transitionToClosed(serviceName: string): void {
    const state = this.getOrCreateState(serviceName);
    state.status = 'CLOSED';
    state.failures = 0;
    state.lastFailure = null;
    this.logger.debug(`Circuit breaker for ${serviceName} closed after success`);
  }
} 