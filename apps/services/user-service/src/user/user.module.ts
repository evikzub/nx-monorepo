import { Module } from '@nestjs/common';
import { DatabaseModule, RabbitMQModule } from '@microservices-app/shared/backend';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';

@Module({
  imports: [DatabaseModule, RabbitMQModule.forRoot() ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}