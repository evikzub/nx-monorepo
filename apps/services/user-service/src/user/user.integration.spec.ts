import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import {
  DatabaseModule,
  AppConfigModule,
} from '@microservices-app/shared/backend';
import { UserModule } from './user.module';
import { AuthModule } from '../auth/auth.module';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto, NotificationType, NotificationPriority, UserRole, NotificationRoutingKey } from '@microservices-app/shared/types';
import { TestLoggerService } from '@microservices-app/shared/backend';
import {
  LoggingInterceptor,
  AppConfigService,
} from '@microservices-app/shared/backend';
import { LogTester } from '@microservices-app/shared/backend';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { mockAmqpConnection } from './__tests__/mocks/amqp-connection.mock';

describe('Users Integration', () => {
  const email = 'test.e2e@example.com';
  const duplicateEmail = 'duplicate.e2e@example.com';
  const adminEmail = 'admin.e2e@example.com';
  const password = 'password123';
  const publicEmail = 'regular@example.com';

  let app: INestApplication;
  let repository: UserRepository;
  let testLogger: TestLoggerService;
  let logTester: LogTester;
  let adminToken: string;
  let config: AppConfigService;

  beforeAll(async () => {
    testLogger = new TestLoggerService();
    logTester = new LogTester(testLogger);

    const moduleRef = await Test.createTestingModule({
      imports: [
        AppConfigModule.forRoot(), // Use forRoot to configure the module
        // ConfigModule.forRoot({
        //   load: [loadConfiguration],
        // }),
        DatabaseModule,
        UserModule,
        AuthModule,
      ],
    })
    .overrideProvider(AmqpConnection)
    .useValue(mockAmqpConnection)
    .compile();

    app = moduleRef.createNestApplication({
      logger: testLogger,
    });

    config = app.get(AppConfigService);
    app.useGlobalInterceptors(new LoggingInterceptor(config));
    await app.init();

    repository = moduleRef.get<UserRepository>(UserRepository);
    //jwtService = moduleRef.get<JwtService>(JwtService);

    // Create admin user and get token
    await createAdminUser();
  });

  async function createAdminUser() {
    // Register admin user
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: adminEmail,
        password,
        firstName: 'Admin',
        lastName: 'User',
        roles: [UserRole.ADMIN]
      }).expect(201);

    if (response.status === 201) {
      adminToken = response.body.accessToken;
    }
  }

  async function deleteUser(email: string) {
    const user = await repository.findByEmail(email, true);
    if (user) {
      await repository.hardDelete(user.id);
    }
  }

  beforeEach(async () => {
    // Clear mocks before each test
    //mockRabbitMQService.publishQueue.mockClear();
    jest.clearAllMocks();

    // Clean up database before each test
    try {
      await deleteUser(email);
      await deleteUser(duplicateEmail);
      await deleteUser(adminEmail);
      await deleteUser(publicEmail);
    } catch (error) {
      console.error('Error cleaning up database:', error);
      throw error;
    }
    testLogger.clear();
  });

  describe('GET /users', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });

    it('should require admin role', async () => {
      // Create regular user and get token
      const regularUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password,
          firstName: 'Test',
          lastName: 'User',
          roles: [UserRole.PUBLIC]
        });

      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${regularUserResponse.body.accessToken}`)
        .expect(403);
    });

    it('should return array of users for admin', async () => {
      // Create a test user first
      const createUserDto: CreateUserDto = {
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
        roles: [UserRole.ADMIN]
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createUserDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.some(user => user.email === email)).toBeTruthy();
      expect(response.body[0]).not.toHaveProperty('password');
    });
  });

  describe('POST /users', () => {
    it('should require admin role to create user', async () => {
      const createUserDto: CreateUserDto = {
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
      };

      // Try without token
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(401);

      // Create regular user and try with their token
      const regularUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: publicEmail,
          password,
          firstName: 'Test',
          lastName: 'User',
        }).expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${regularUserResponse.body.accessToken}`)
        .send(createUserDto)
        .expect(403);
    });

    it('should create a new user as admin and log the operation', async () => {
      const createUserDto: CreateUserDto = {
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('email', createUserDto.email);
          expect(res.body).not.toHaveProperty('password');
          expect(res.body).toHaveProperty('id');
        });

      logTester.expectSuccessLog({
        method: 'POST',
        url: '/users',
        statusCode: 201,
        requestBody: {
          email,
          firstName: 'Test',
          lastName: 'User',
          password: '***',
        },
        responseData: expect.objectContaining({
          email,
          firstName: 'Test',
          lastName: 'User',
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      });

      // Verify RabbitMQ notification was sent
      expect(mockAmqpConnection.publish).toHaveBeenCalledTimes(1);
      expect(mockAmqpConnection.publish).toHaveBeenCalledWith(
        config.envConfig.rabbitmq.exchanges.notifications,
        NotificationRoutingKey.EMAIL_VERIFICATION,
        expect.objectContaining({
          type: NotificationType.EMAIL_VERIFICATION,
                recipient: email,
                templateId: 'email-verification',
                priority: NotificationPriority.HIGH,
                data: expect.objectContaining({
                  firstName: 'Test',
                  verificationUrl: expect.stringContaining('verify-email?token=')
                }),
                correlationId: expect.any(String),
              })
      );
    });

    it('should return 409 for duplicate email', async () => {
      const createUserDto: CreateUserDto = {
        email: duplicateEmail,
        password,
        firstName: 'Test',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createUserDto)
        .expect(201);

      testLogger.clear();

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createUserDto)
        .expect(409);

      logTester.expectErrorLog({
        method: 'POST',
        url: '/users',
        statusCode: 409,
        errorMessage: 'User with this email already exists',
        errorType: 'ConflictException',
        requestBody: {
          email: duplicateEmail,
          firstName: 'Test',
          lastName: 'User',
          password: '***',
        },
      });
    });

    it('should create a new user and send verification email', async () => {
      const createUserDto: CreateUserDto = {
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createUserDto)
        .expect(201);

      // Verify the response
      expect(response.body).toBeDefined();
      expect(response.body.email).toBe(email);

      // Verify RabbitMQ notification was sent
      expect(mockAmqpConnection.publish).toHaveBeenCalledTimes(1);
      expect(mockAmqpConnection.publish).toHaveBeenCalledWith(
        config.envConfig.rabbitmq.exchanges.notifications,
        NotificationRoutingKey.EMAIL_VERIFICATION,
        expect.objectContaining({
          type: NotificationType.EMAIL_VERIFICATION,
          recipient: email,
          templateId: 'email-verification',
          priority: NotificationPriority.HIGH,
          data: expect.objectContaining({
            firstName: 'Test',
            verificationUrl: expect.stringContaining('verify-email?token=')
          })
        })
      );
    });

    it('should handle notification failure gracefully', async () => {
      // Mock notification failure
      mockAmqpConnection.publish.mockRejectedValueOnce(new Error('Queue error'));

      const createUserDto: CreateUserDto = {
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
      };

      // User creation should still succeed
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createUserDto)
        .expect(201);

      // Verify the response
      expect(response.body).toBeDefined();
      expect(response.body.email).toBe(email);
      
      // Verify the notification was attempted
      expect(mockAmqpConnection.publish).toHaveBeenCalledTimes(1);
    });
  });

  afterAll(async () => {
    await deleteUser(adminEmail);

    // Add a small delay to ensure all connections are closed
    await new Promise(resolve => setTimeout(resolve, 500));

    await app.close();
  });
});
