import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { HttpHealthIndicator } from '@nestjs/terminus';
//import { gatewayConfig } from '../config/gateway.config';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return {
        status: 'ok',
        timestamp: new Date().toISOString()
      };
    // return this.health.check([
    //   () => this.http.pingCheck(
    //     'user-service', 
    //     `http://localhost:${gatewayConfig.services.userService.port}/health`
    //   ),
    //   // Add other service health checks
    // ]);
  }
} 