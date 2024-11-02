import { Injectable } from '@nestjs/common';
import { IMetricsCollector } from '../interfaces/monitoring.interface';

@Injectable()
export class MetricsService implements IMetricsCollector {
  incrementCounter(name: string, tags?: Record<string, string>): void {
    // Implementation
  }

  recordTiming(name: string, value: number, tags?: Record<string, string>): void {
    // Implementation
  }

  recordGauge(name: string, value: number, tags?: Record<string, string>): void {
    // Implementation
  }
} 