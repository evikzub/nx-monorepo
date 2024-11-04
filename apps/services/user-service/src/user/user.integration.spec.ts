import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import {
  DatabaseModule,
  AppConfigModule
} from '@microservices-app/shared/backend';
import { UserModule } from './user.module';
import { AuthModule } from '../auth/auth.module';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto, UserRole } from '@microservices-app/shared/types';
import { TestLoggerService } from '@microservices-app/shared/backend';
import {
  LoggingInterceptor,
  AppConfigService,
} from '@microservices-app/shared/backend';
import { LogTester } from '@microservices-app/shared/backend';
//import { JwtService } from '@nestjs/jwt';

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
  //let jwtService: JwtService;
  let adminToken: string;

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
    }).compile();

    app = moduleRef.createNestApplication({
      logger: testLogger,
    });

    const configService = app.get(AppConfigService);
    app.useGlobalInterceptors(new LoggingInterceptor(configService));
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
        roles: [UserRole.ADMIN]
      });

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
        });

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
  });

  afterAll(async () => {
    await deleteUser(adminEmail);
    await app.close();
  });
});
