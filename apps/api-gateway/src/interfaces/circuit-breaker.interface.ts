export type CircuitBreakerStatus = 'OPEN' | 'CLOSED' | 'HALF_OPEN';

export interface ICircuitBreakerService {
  isOpen(serviceName: string): boolean;
  recordSuccess(serviceName: string): void;
  recordFailure(serviceName: string): void;
  reset(serviceName: string): void;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailure: number | null;
  status: CircuitBreakerStatus;
} 