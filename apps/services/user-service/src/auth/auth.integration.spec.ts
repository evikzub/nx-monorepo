import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from './auth.module';
import { AppConfigModule, AppConfigService, DatabaseModule } from '@microservices-app/shared/backend';
import { AuthTestingUtils } from '@microservices-app/shared/backend';
import { AuthErrorCode, UserRole } from '@microservices-app/shared/types';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { UserRepository } from '../repositories/user.repository';
import { mockAmqpConnection } from '../user/__tests__/mocks/amqp-connection.mock';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

describe('Auth Integration', () => {
  const email = 'test.auth.integration@example.com';

  let app: INestApplication;
  let jwtService: JwtService;
  let userService: UserService;
  let repository: UserRepository;

  // TODO: Change it to .env.test
  const mockConfigService = {
    envConfig: {
      nodeEnv: 'test',
      jwt: {
        secret: 'test-secret',
        expiresIn: '1h'
      },
      database: {
        url: 'postgres://postgres:postgres@localhost:5432/entrepreneur',
        schemaName: 'public',
        poolMin: '1',
        poolMax: '10'
      },
      consul: {
        host: 'localhost',
        port: '8500'
      },
      userService: {
        id: 'user-service-test',
        name: 'user-service',
        port: '3001',
        host: 'localhost',
        timeout: '5000'
      },
      rabbitmq: {
        url: 'amqp://guest:guest@localhost:5672',
        queues: {
          notifications: 'notifications-test',
          deadLetter: 'dead-letter-test'
        },
        exchanges: {
          notifications: 'notifications-test',
          deadLetter: 'dead-letter-test'
        }
      }
    }
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppConfigModule.forRoot(), // Use forRoot to configure the module
        DatabaseModule,
        UserModule,
        AuthModule
      ],
    //   providers: [
    //     {
    //       provide: AmqpConnection,
    //       useValue: mockAmqpConnection,
    //     },
    //   ],
    })
      .overrideProvider(AppConfigService)
      .useValue(mockConfigService)
      .overrideProvider(AmqpConnection)
      .useValue(mockAmqpConnection)
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);

    userService = moduleFixture.get<UserService>(UserService);
    repository = moduleFixture.get<UserRepository>(UserRepository);

    await app.init();

    await userService.createUser({
      email,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      roles: [UserRole.ADMIN]
    });

  });

//   beforeEach(async () => {
//     // Clean up database before each test
//     try {
//       await deleteUser(email);
//       //await deleteUser(duplicateEmail);
//     } catch (error) {
//       console.error('Error cleaning up database:', error);
//       throw error;
//     }
//     //testLogger.clear();
//   });

  afterAll(async () => {
    // Clean up test data
    //const userService = app.get('UserService');
    deleteUser(email);
    await app.close();
  });

  async function deleteUser(email: string) {
    const user = await repository.findByEmail(email, true);
    if (user) {
      await repository.hardDelete(user.id);
    }
  }


  describe('Auth Endpoints', () => {
    describe('POST /auth/login', () => {
      it('should login with valid credentials', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email,
            password: 'password123'
          })
          .expect(200)
          .expect(res => {
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('email', email);
            expect(res.body.user.roles).toContain(UserRole.ADMIN);
          });
      });

      it('should fail with invalid credentials', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email,
            password: 'wrongpassword'
          })
          .expect(401)
          .expect(res => {
            expect(res.body).toHaveProperty('code', 'INVALID_CREDENTIALS');
          });
      });

      it('should fail with non-existent user', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'password123'
          })
          .expect(401)
          .expect(res => {
            expect(res.body).toHaveProperty('code', AuthErrorCode.INVALID_CREDENTIALS);
          });
      });
    });

    describe('Protected Routes', () => {
      it('should allow access with valid token', () => {
        const token = AuthTestingUtils.createTestToken(jwtService, {
          roles: [UserRole.ADMIN]
        });

        return request(app.getHttpServer())
          .get('/users')  // actual protected endpoint
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      });

      it('should deny access with invalid token', () => {
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });

      it('should deny access without token', () => {
        return request(app.getHttpServer())
          .get('/users')
          .expect(401);
      });

      it('should deny access with expired token', async () => {
        const token = AuthTestingUtils.createExpiredToken(jwtService, {
            //roles: [UserRole.ADMIN]
          });


      // Verify token is actually expired
      const decodedToken = AuthTestingUtils.verifyToken(jwtService, token);
      expect(decodedToken).toBeNull();

      return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(401);
      });

      it('should deny access with insufficient roles', () => {
        const token = AuthTestingUtils.createTestToken(jwtService, {
          roles: [UserRole.PUBLIC]
        });

        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(403);
      });

      it('should allow access with non-expired token', () => {
        const token = AuthTestingUtils.createTestToken(jwtService, {
          roles: [UserRole.ADMIN]
        }, { expiresIn: '1h' });
    
        return request(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      });
    
      it('should include correct user information in token', () => {
        const token = AuthTestingUtils.createTokenForUser(jwtService, {
          id: '123',
          email: 'test@example.com',
          roles: [UserRole.ADMIN],
          firstName: 'Test',
          lastName: 'User'
        });
    
        const decoded = AuthTestingUtils.decodeToken(token);
        expect(decoded.sub).toBe('123');
        expect(decoded.email).toBe('test@example.com');
        expect(decoded.roles).toContain(UserRole.ADMIN);
      });
    });

    describe('POST /auth/refresh', () => {
      it('should refresh token with valid refresh token', async () => {
        // First login to get a valid token
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email,
            password: 'password123'
          });

        return request(app.getHttpServer())
          .post('/auth/refresh')
          .send({
            refreshToken: loginResponse.body.refreshToken
          })
          .expect(201)
          .expect(res => {
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('email', email);
          });
      });

      it('should fail with invalid refresh token', () => {
        return request(app.getHttpServer())
          .post('/auth/refresh')
          .send({
            refreshToken: 'invalid-token'
          })
          .expect(401)
          .expect(res => {
            expect(res.body).toHaveProperty('code', AuthErrorCode.INVALID_REFRESH_TOKEN);
          });
      });

      it('should fail when using access token as refresh token', async () => {
        // First login to get tokens
        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email,
            password: 'password123'
          });

        return request(app.getHttpServer())
          .post('/auth/refresh')
          .send({
            refreshToken: loginResponse.body.accessToken // Try to use access token
          })
          .expect(401)
          .expect(res => {
            expect(res.body).toHaveProperty('code', AuthErrorCode.INVALID_REFRESH_TOKEN);
            expect(res.body).toHaveProperty('message', 'Invalid refresh token');
          });
      });

      it('should fail with expired refresh token', async () => {
        const expiredToken = AuthTestingUtils.createExpiredToken(jwtService, {
          type: 'refresh'
        });

        return request(app.getHttpServer())
          .post('/auth/refresh')
          .send({
            refreshToken: expiredToken
          })
          .expect(401)
          .expect(res => {
            expect(res.body).toHaveProperty('code', AuthErrorCode.INVALID_REFRESH_TOKEN);
          });
      });
    });

    describe('GET /auth/verify', () => {
      it('should verify valid token', async () => {
        const token = AuthTestingUtils.createTestToken(jwtService, {
          roles: [UserRole.ADMIN]
        });

        return request(app.getHttpServer())
          .get('/auth/verify')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .expect(res => {
            expect(res.body).toHaveProperty('isValid', true);
            expect(res.body).toHaveProperty('payload');
            expect(res.body.payload).toHaveProperty('roles');
          });
      });

      it('should fail with invalid token', () => {
        return request(app.getHttpServer())
          .get('/auth/verify')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });
    });

    describe('POST /auth/register', () => {
      const newUserEmail = 'new.user@example.com';

      afterEach(async () => {
        // Clean up test user
        try {
          await deleteUser(newUserEmail);
        } catch {
          // Ignore if user doesn't exist
        }
      });

      it('should register new user and return tokens', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: newUserEmail,
            password: 'password123',
            firstName: 'New',
            lastName: 'User'
          })
          .expect(201)
          .expect(res => {
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('email', newUserEmail);
            expect(res.body.user.roles).toContain(UserRole.PUBLIC);
          });
      });

      it('should fail with duplicate email', async () => {
        // First registration
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: newUserEmail,
            password: 'password123'
          });

        // Duplicate registration
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: newUserEmail,
            password: 'different123'
          })
          .expect(409)
          .expect(res => {
            expect(res.body).toHaveProperty('error', 'Conflict');
            expect(res.body).toHaveProperty('message', 'User with this email already exists');
          });
      });

      it('should validate password requirements', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: newUserEmail,
            password: '123' // Too short
          })
          .expect(400)
          .expect(res => {
            //console.log('res.body', res.body);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('Validation failed');
          });
      });
    });
  });
}); 