import { AppConfigService } from '@microservices-app/shared/backend';
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private configService: AppConfigService,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Add basic checks
      () => this.http.pingCheck(
        'self-check',
        `http://localhost:${this.configService.envConfig.userService.port}/api/health`
      ),
      // Add memory health check
      () => Promise.resolve({
        memory_heap: {
          status: 'up',
          details: {
            used: process.memoryUsage().heapUsed,
            total: process.memoryUsage().heapTotal,
          },
        },
      }),
    ]);
  }
} 