import { INestApplication, Logger } from '@nestjs/common';
import supertest from 'supertest';
import nock from 'nock';
import { AppConfigService } from '@microservices-app/shared/backend';
import { UserRole, AuthErrorCode } from '@microservices-app/shared/types';
import {
  createTestingApp,
  logAppDetails,
  mockUserService,
  createTestToken
} from '../testing/test-utils';
import { PortManager } from '../testing/port-manager';

describe('Proxy Integration Tests', () => {
  let app: INestApplication;
  let config: AppConfigService;
  let userServiceMock: ReturnType<typeof mockUserService>;
  const logger = new Logger('ProxyIntegrationTest');

  // Test data
  const testUser = {
    id: '123',
    email: 'test@example.com',
    roles: [UserRole.ADMIN],
    firstName: 'Test',
    lastName: 'User'
  };

  const publicUser = {
    id: '456',
    email: 'public@example.com',
    roles: [UserRole.PUBLIC],
    firstName: 'Public',
    lastName: 'User'
  };

  beforeAll(async () => {
    try {
      logger.debug('Setting up test app...');
      const testApp = await createTestingApp();
      app = testApp.app;
      config = testApp.config;
      //logger.debug('config', config);
      userServiceMock = mockUserService(config);
      //logger = new Logger('ProxyIntegrationTest');

      logger.debug(`Test app configured with:
        Gateway: ${config.envConfig.apiGateway.host}:${config.envConfig.apiGateway.port}
        User Service: ${config.envConfig.userService.host}:${config.envConfig.userService.port}
        `);

      logAppDetails(app, logger);

      // Log server details
      logger.debug('Test app server details:', {
        url: `http://${config.envConfig.apiGateway.host}:${config.envConfig.apiGateway.port}`,
      });

      const httpServer = app.getHttpServer();
      // You can also make a test request to verify the server is running
      await supertest(httpServer)
        .get('/health') // Assuming you have a health check endpoint
        .then((response) => {
          logger.debug('Health check response:', response.status);
        })
        .catch((error) => {
          logger.error('Health check failed:', error.message);
        });

        // Check routers
        //const router = httpServer._events.request._router;      
        // logger.debug('Registered routes:', 
        //   router.stack
        //     .filter(layer => layer.route)
        //     .map(layer => ({
        //       path: layer.route?.path,
        //       methods: layer.route?.methods
        //     }))
        // );
  
    } catch (error) {
      logger.error('Failed to setup test app:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await app.close();
    PortManager.releaseAllPorts();
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    expect(nock.isDone()).toBeTruthy();
  });

  describe('Auth Endpoints', () => {
    describe('POST /auth/login', () => {
      it('should forward login request to user service', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'password123'
        };

        const mockResponse = {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          user: testUser
        };

        userServiceMock.mockLogin(loginData, mockResponse);

        const response = await supertest(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(200);

        expect(response.body).toEqual(mockResponse);
      });

      it('should handle invalid credentials', async () => {
        const loginData = {
          email: 'wrong@example.com',
          password: 'wrongpass'
        };

        userServiceMock.mockLoginError(loginData, {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: 'Invalid email or password'
        });

        await supertest(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(401);
      });
    });

    describe('POST /auth/refresh', () => {
      it('should forward refresh token request', async () => {
        const refreshData = {
          refreshToken: 'valid-refresh-token'
        };

        const mockResponse = {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          user: testUser
        };

        userServiceMock.mockRefreshToken(refreshData, mockResponse);

        const response = await supertest(app.getHttpServer())
          .post('/auth/refresh')
          .send(refreshData)
          .expect(200);

        expect(response.body).toEqual(mockResponse);
      });

      it('should handle invalid refresh token', async () => {
        const refreshData = {
          refreshToken: 'invalid-refresh-token'
        };

        userServiceMock.mockRefreshTokenError(refreshData, {
          code: AuthErrorCode.INVALID_REFRESH_TOKEN,
          message: 'Invalid refresh token'
        });

        await supertest(app.getHttpServer())
          .post('/auth/refresh')
          .send(refreshData)
          .expect(401);
      });
    });
  });

  describe('Protected Endpoints', () => {
    describe('GET /users', () => {
      it('should require authentication', async () => {
        await supertest(app.getHttpServer())
          .get('/users')
          .expect(401);
      });

      it('should require admin role', async () => {
        const token = createTestToken(config, publicUser);

        await supertest(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(403);
      });

      it('should return users list for admin', async () => {
        const token = createTestToken(config, testUser);
        const mockUsers = [testUser, publicUser];

        userServiceMock.mockGetUsers(mockUsers);

        const response = await supertest(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body).toEqual(mockUsers);
      });

      it('should handle expired token', async () => {
        const expiredToken = createTestToken(config, testUser, { expiresIn: '-1h' });

        await supertest(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${expiredToken}`)
          .expect(401)
          .expect(res => {
            //logger.debug('Expired token response:', res.body);
            expect(res.body.message).toBe('Invalid token');
            //expect(res.body.code).toBe(AuthErrorCode.TOKEN_EXPIRED);
          });
      });
    });

    describe('Error Handling', () => {
      it('should handle service errors with valid auth', async () => {
        const token = createTestToken(config, testUser);
        userServiceMock.mockServiceError();

        const response = await supertest(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(500);

        expect(response.body).toHaveProperty('message');
      });

      it('should handle network errors with valid auth', async () => {
        const token = createTestToken(config, testUser);
        userServiceMock.mockNetworkError();

        await supertest(app.getHttpServer())
          .get('/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(503);
      });
    });
  });
});
