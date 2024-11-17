import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { NewUser, User, UpdateUser, NotificationPriority, NotificationPayload, NotificationType, NotificationRoutingKey } from '@microservices-app/shared/types';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AppConfigService, CorrelationService, SpanType, TraceService } from '@microservices-app/shared/backend';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: AppConfigService
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

      await this.sendVerificationEmail(user);

      TraceService.endSpan(notificationSpan);
      TraceService.endSpan(span);

      return user;
    } catch (error) {
      TraceService.endSpan(span, { error: error.message });
      throw error;
    }
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    const correlationId = CorrelationService.getRequestId() || uuidv4();

    try {
      const verificationToken = uuidv4(); // In practice, store this token
      const verificationUrl = `http://localhost:4200/verify-email?token=${verificationToken}`;

      const notificationPayload: NotificationPayload = {
        type: NotificationType.EMAIL_VERIFICATION,
        recipient: user.email,
        templateId: 'email-verification',
        data: {
          firstName: user.firstName,
          verificationUrl,
        },
        priority: NotificationPriority.HIGH,
        correlationId,
      };

      // await this.rabbitMQService.publishQueue(
      //   this.configService.envConfig.rabbitmq.queues.notifications,
      //   // 'notifications.exchange',
      //   // 'notification.email',
      //   notificationPayload
      // );

      this.logger.debug(
        `Publishing verification email to ${NotificationRoutingKey.EMAIL_VERIFICATION} using ${this.configService.envConfig.rabbitmq.exchanges.notifications} exchange`);
      // await this.rabbitMQService.publishExchange(
      //   this.configService.envConfig.rabbitmq.exchanges.notifications,
      //   NotificationRoutingKey.EMAIL_VERIFICATION,
      //   //'notification.email.verification',
      //   notificationPayload
      // );
      await this.amqpConnection.publish(
        this.configService.envConfig.rabbitmq.exchanges.notifications,
        NotificationRoutingKey.EMAIL_VERIFICATION,
        notificationPayload,
        // {
        //   persistent: true,
        //   messageId: correlationId,
        // }
      );

      this.logger.debug(`Verification email queued for ${user.email}`, {
        correlationId
      });
    } catch (error) {
      this.logger.error(`Failed to queue verification email: ${error.message}`, {
        correlationId,
        userId: user.id,
        email: user.email
      });
      //throw error;
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