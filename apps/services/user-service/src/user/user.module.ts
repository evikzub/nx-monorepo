import { Module } from '@nestjs/common';

import { DatabaseModule, ProviderModule } from '@microservices-app/shared/backend';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { MessageService } from '../message/message.service';

@Module({
  imports: [DatabaseModule, ProviderModule ],
  controllers: [UserController],
  providers: [UserService, UserRepository, MessageService ],
  exports: [UserService],
})
export class UserModule {}
