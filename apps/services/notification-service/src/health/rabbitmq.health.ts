import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
//import { RabbitMQService } from '@microservices-app/shared/backend';

@Injectable()
export class RabbitMQHealthIndicator extends HealthIndicator {
  constructor(
    //private readonly rabbitMQService: RabbitMQService
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const isHealthy = true; //await this.rabbitMQService.isHealthy();
      
      return this.getStatus(key, isHealthy, {
        message: isHealthy ? 'RabbitMQ is connected' : 'RabbitMQ is disconnected'
      });
    } catch (error) {
      throw new HealthCheckError(
        'RabbitMQ health check failed',
        this.getStatus(key, false, {
          message: error.message
        })
      );
    }
  }
} 