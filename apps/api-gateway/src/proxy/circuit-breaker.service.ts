import { Injectable, Logger } from '@nestjs/common';

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private states: Map<string, CircuitBreakerState> = new Map();
  
  private readonly FAILURE_THRESHOLD = 5;
  private readonly RESET_TIMEOUT = 60000; // 1 minute
  
  isOpen(serviceId: string): boolean {
    const state = this.getState(serviceId);
    
    if (state.isOpen) {
      // Check if circuit can be half-opened
      if (Date.now() - state.lastFailure > this.RESET_TIMEOUT) {
        state.isOpen = false;
        this.logger.log(`Circuit half-opened for service: ${serviceId}`);
        return false;
      }
      return true;
    }
    
    return false;
  }

  recordSuccess(serviceId: string): void {
    const state = this.getState(serviceId);
    state.failures = 0;
    state.isOpen = false;
  }

  recordFailure(serviceId: string): void {
    const state = this.getState(serviceId);
    state.failures++;
    state.lastFailure = Date.now();
    
    if (state.failures >= this.FAILURE_THRESHOLD) {
      state.isOpen = true;
      this.logger.warn(`Circuit opened for service: ${serviceId}`);
    }
  }

  private getState(serviceId: string): CircuitBreakerState {
    if (!this.states.has(serviceId)) {
      this.states.set(serviceId, {
        failures: 0,
        lastFailure: 0,
        isOpen: false
      });
    }
    return this.states.get(serviceId)!;
  }
} 