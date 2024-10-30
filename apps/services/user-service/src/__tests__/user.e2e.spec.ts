import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  DatabaseModule,
  loadConfiguration,
} from '@microservices-app/shared/backend';
import { UserModule } from '../user.module';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto, NotFoundError } from '@microservices-app/shared/types';
import { TestLoggerService } from '@microservices-app/shared/backend';
import {
  LoggingInterceptor,
  ConfigService,
} from '@microservices-app/shared/backend';
import { LogTester } from '@microservices-app/shared/backend';

describe('Users E2E', () => {
  let app: INestApplication;
  let repository: UserRepository;
  let testLogger: TestLoggerService;
  let logTester: LogTester;

  beforeAll(async () => {
    testLogger = new TestLoggerService();
    logTester = new LogTester(testLogger);

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [loadConfiguration],
        }),
        DatabaseModule,
        UserModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication({
      logger: testLogger,
    });

    const configService = app.get(ConfigService);
    app.useGlobalInterceptors(new LoggingInterceptor(configService));
    await app.init();

    repository = moduleRef.get<UserRepository>(UserRepository);
  });

  beforeEach(async () => {
    testLogger.clear();
    // Clean up database before each test
    try {
      const users = await repository.findAll();
      if (users.length > 0) {
        await Promise.all(
          users.map(async (user) => {
            try {
              await repository.hardDelete(user.id);
            } catch (error) {
              // Ignore NotFoundError during cleanup
              if (!(error instanceof NotFoundError)) {
                throw error;
              }
            }
          })
        );
      }
    } catch (error) {
      console.error('Error cleaning up database:', error);
      throw error;
    }
  });

  describe('GET /users', () => {
    it('should return empty array when no users exist', () => {
      return request(app.getHttpServer()).get('/users').expect(200).expect([]);
    });

    it('should return array of users', async () => {
      // Create a test user first
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toHaveProperty('email', createUserDto.email);
      expect(response.body[0]).not.toHaveProperty('password');
    });

    it('should return user not found', async () => {
      const id = '8303242c-3511-4fc7-a9c3-d79ac8027679';

      await request(app.getHttpServer())
        .get(`/users/${id}`)
        .expect(404);

      logTester.expectErrorLog({
        method: 'GET',
        url: `/users/${id}`,
        statusCode: 404,
        errorMessage: 'User not found',
        errorType: 'NotFoundException',
        requestBody: {},
      });
    });
  });

  describe('POST /users', () => {
    it('should create a new user and log the operation', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/users')
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
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: '***',
        },
        responseData: expect.objectContaining({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          id: expect.any(String),
        }),
      });
    });

    it('should return 409 for duplicate email', async () => {
      const createUserDto: CreateUserDto = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      testLogger.clear();

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(409);

      logTester.expectErrorLog({
        method: 'POST',
        url: '/users',
        statusCode: 409,
        errorMessage: 'User with this email already exists',
        errorType: 'ConflictException',
        requestBody: {
          email: 'duplicate@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: '***',
        },
      });
    });
  });
});
