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
  const email = 'test.e2e@example.com';
  const duplicateEmail = 'duplicate.e2e@example.com';

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

  async function deleteUser(email: string) {
    const user = await repository.findByEmail(email, true);
    if (user) {
      await repository.hardDelete(user.id);
    }
  }

  beforeEach(async () => {
    // Clean up database before each test
    try {
      await deleteUser(email);
      await deleteUser(duplicateEmail);
    } catch (error) {
      console.error('Error cleaning up database:', error);
      throw error;
    }
    testLogger.clear();
  });

  describe('GET /users', () => {
    it('should return empty array when no users exist', () => {
      // Will not work for parallel testing
      return request(app.getHttpServer()).get('/users').expect(200).expect([]);
    });

    it('should return array of users', async () => {
      // Create a test user first
      const createUserDto: CreateUserDto = {
        email,
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
      if (response.body.length === 1) {
        expect(response.body[0]).toHaveProperty('email', createUserDto.email);
      }
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
        email,
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
    });

    it('should return 409 for duplicate email', async () => {
      const createUserDto: CreateUserDto = {
        email: duplicateEmail,
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
          email: duplicateEmail,
          firstName: 'Test',
          lastName: 'User',
          password: '***',
        },
      });
    });
  });
});
