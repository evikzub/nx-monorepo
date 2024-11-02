import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import nock from 'nock';
import { AppConfigService } from '@microservices-app/shared/backend';
import { AddressInfo } from 'net';
import { PortManager } from './port-manager';


export async function logAppDetails(app: INestApplication, logger: Logger | Console) {
    const httpServer = app.getHttpServer();
    const serverAddress = httpServer.address() as AddressInfo;
    
    logger.debug('Application server details:', {
      address: serverAddress?.address || 'not bound',
      port: serverAddress?.port || 'not bound',
      family: serverAddress?.family,
      listening: httpServer.listening
    });
  }

export async function createTestingApp(): Promise<{
  app: INestApplication;
  config: AppConfigService;
}> {
  try {
    // Get ports for all services
    const [gatewayPort, userServicePort] = await PortManager.getMultiplePorts(2);
    console.debug(`Allocated ports - Gateway: ${gatewayPort}, UserService: ${userServicePort}`);

    // Set environment variables with dynamic ports
    process.env.API_GATEWAY_PORT = gatewayPort.toString();
    //process.env.USER_SERVICE_PORT = userServicePort.toString();
    
    //process.env.API_GATEWAY_PORT = '3020'; // TODO: Remove this
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    const config = app.get(AppConfigService);

    //await app.init();
    // Initialize and start listening
    await app.listen(config.envConfig.apiGateway.port);
    
    return { app, config };
  } catch (error) {
    console.error('Failed to create testing app:', error);
    throw error;
  }
}

export function mockUserService(config: AppConfigService) {
  const userService = config.envConfig.userService;
  const baseUrl = `http://${userService.host}:${userService.port}`;
  
  return {
    // Basic GET request mock
    mockGetUsers: (users: any[] = []) => {
      return nock(baseUrl)
        .get('/users')
        .reply(200, users);
    },

    // Mock with query parameters
    mockGetUsersWithQuery: (query: Record<string, string>, response: any) => {
      return nock(baseUrl)
        .get('/users')
        .query(query) // e.g., { page: '1', limit: '10' }
        .reply(200, response);
    },

    // Mock POST request with body validation
    mockCreateUser: (expectedBody: any, createdUser: any) => {
      return nock(baseUrl)
        .post('/users', expectedBody)
        .reply(201, createdUser);
    },

    // Mock with specific headers
    mockAuthenticatedRequest: (token: string, response: any) => {
      return nock(baseUrl)
        .get('/users')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, response);
    },

    // Mock error responses
    mockServiceError: () => {
      return nock(baseUrl)
        .get('/users')
        .reply(500, { message: 'Internal Server Error' });
    },

    // Mock network error
    mockNetworkError: () => {
      return nock(baseUrl)
        .get('/users')
        //.replyWithError('Network error');
        .reply(503, { message: 'Service Unavailable' });
    }
  };
}
