import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { NewUser, User, UpdateUser } from '@microservices-app/shared/types';
import * as bcrypt from 'bcrypt';
import { SpanType, TraceService } from '@microservices-app/shared/backend';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly userRepository: UserRepository) {}

  async createUser(data: NewUser): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Tracing example -> Database operation
    TraceService.startSpan(SpanType.DB_TRANSACTION, {
        operation: 'createUser'
        });
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
    TraceService.endSpan(SpanType.DB_TRANSACTION);
    return user;
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