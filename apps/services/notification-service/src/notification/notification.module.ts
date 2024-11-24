import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { EmailService } from '../email/email.service';
import { RabbitMQModule } from '@microservices-app/shared/backend';

@Module({
  imports: [
    RabbitMQModule.forRoot(),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, EmailService],
  exports: [NotificationService],
})
export class NotificationModule {} 