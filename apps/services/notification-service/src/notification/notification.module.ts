import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { EmailService } from '../email/email.service';
import { RabbitMQModule } from '@microservices-app/shared/backend';
import { DeadLetterService } from './dead-letter.service';

@Module({
  imports: [
    RabbitMQModule.forRoot(),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, DeadLetterService, EmailService],
  exports: [NotificationService],
})
export class NotificationModule {} 