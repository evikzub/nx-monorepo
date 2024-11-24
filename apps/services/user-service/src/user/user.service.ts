import * as bcrypt from 'bcrypt';
import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';

import { NewUser, User, UpdateUser } from '@microservices-app/shared/types';
import { SpanType, TraceService } from '@microservices-app/shared/backend';

import { UserRepository } from '../repositories/user.repository';
import { MessageService } from '../message/message.service';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly messageService: MessageService,
  ) {}

  async createUser(data: NewUser): Promise<User> {
    const span = TraceService.startSpan(SpanType.BUSINESS_LOGIC, {
      operation: 'createUser'
    });

    try {
      // Check existing user
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      let hashedPassword = null;
      if (data.password) {
        // Hash password
        hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);
      }
      // Tracing insert -> Database operation
      const dbSpan = TraceService.startSpan(SpanType.DB_TRANSACTION, {
        operation: 'createUser'
      });

      // Create user
      const user = await this.userRepository.create({
        ...data,
        password: hashedPassword,
      });

      TraceService.endSpan(dbSpan);

      // Send verification email
      const notificationSpan = TraceService.startSpan(SpanType.MESSAGE_PUBLISH, {
        operation: 'sendVerificationEmail'
      });

      await this.messageService.sendVerificationEmail(user);

      TraceService.endSpan(notificationSpan);
      TraceService.endSpan(span);

      return user;
    } catch (error) {
      TraceService.endSpan(span, { error: error.message });
      throw error;
    }
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async updateUser(id: string, data: UpdateUser): Promise<User> {
    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already taken');
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, this.SALT_ROUNDS);
    }

    try {
      return await this.userRepository.update(id, data);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.userRepository.softDelete(id);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
} 