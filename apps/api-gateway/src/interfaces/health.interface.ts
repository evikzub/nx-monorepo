export interface IHealthCheck {
  check(): Promise<HealthCheckResult>;
  getName(): string;
  getStatus(): HealthStatus;
}

export interface HealthCheckResult {
  status: HealthStatus;
  details: Record<string, any>;
  timestamp: Date;
  duration: number;
}

export interface ServiceHealth {
  serviceId: string;
  status: HealthStatus;
  lastCheck: Date;
  details: HealthCheckDetails;
}

export interface HealthCheckDetails {
  type: string;
  endpoint?: string;
  interval: number;
  timeout: number;
  threshold: number;
  checks: HealthCheckResult[];
}

export type HealthStatus = 'HEALTHY' | 'UNHEALTHY' | 'DEGRADED' | 'UNKNOWN'; 