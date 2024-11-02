import { INestApplication, Logger } from '@nestjs/common';
import supertest from 'supertest';
import nock from 'nock';
import { AppConfigService } from '@microservices-app/shared/backend';
import {
  createTestingApp,
  logAppDetails,
  mockUserService,
} from '../testing/test-utils';
import { PortManager } from '../testing/port-manager';

describe('Proxy Integration Tests', () => {
  let app: INestApplication;
  let config: AppConfigService;
  let userServiceMock: ReturnType<typeof mockUserService>;
  const logger = new Logger('ProxyIntegrationTest');

  beforeAll(async () => {
    try {
      logger.debug('Setting up test app...');
      const testApp = await createTestingApp();
      app = testApp.app;
      config = testApp.config;
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

  describe('GET /users', () => {
    it('should return users list', async () => {
      const mockUsers = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ];

      logger.debug('Setting up mock for GET /users');
      userServiceMock.mockGetUsers(mockUsers);

      const response = await supertest(app.getHttpServer())
        .get('/users')
        .expect(200)
        .catch((error) => {
          logger.error('Test failed', {
            error: error.message,
            response: error.response?.body,
          });
          throw error;
        });

      expect(response.body).toEqual(mockUsers);
    });

    // TODO: Implement this test with the pagination
    it.skip('should handle query parameters', async () => {
      const query = { page: '1', limit: '10' };
      const mockResponse = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 },
      };

      userServiceMock.mockGetUsersWithQuery(query, mockResponse);

      const response = await supertest(app.getHttpServer())
        .get('/users')
        .query(query)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
    });

    // TODO: Implement this test with the authentication
    it.skip('should handle authentication', async () => {
      const token = 'test-token';
      const mockResponse = { authenticated: true };

      userServiceMock.mockAuthenticatedRequest(token, mockResponse);

      const response = await supertest(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
    });

    it('should handle service errors', async () => {
      userServiceMock.mockServiceError();

      const response = await supertest(app.getHttpServer())
        .get('/users')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle network errors', async () => {
      userServiceMock.mockNetworkError();

      await supertest(app.getHttpServer()).get('/users').expect(503);
    });
  });
});
