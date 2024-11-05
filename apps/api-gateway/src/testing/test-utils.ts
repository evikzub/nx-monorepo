import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import nock from 'nock';
import { AppConfigModule, AppConfigService } from '@microservices-app/shared/backend';
import { AddressInfo } from 'net';
import { PortManager } from './port-manager';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@microservices-app/shared/types';


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
      imports: [
        AppConfigModule.forRoot(), // Use forRoot to configure the module
        AppModule
      ],
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

export function createTestToken(
  config: AppConfigService,
  user: { 
    id: string; 
    email: string; 
    roles: UserRole[]; 
    firstName?: string; 
    lastName?: string 
  }, 
  options: { expiresIn?: string } = {}
) {
  const jwtService = new JwtService({
    secret: config.envConfig.jwt.secret || 'test-secret',
    signOptions: { expiresIn: options.expiresIn || '1h' }
  });

  return jwtService.sign({
    sub: user.id,
    email: user.email,
    roles: user.roles,
    firstName: user.firstName,
    lastName: user.lastName,
    type: 'access'
  });
}

export function mockUserService(config: AppConfigService) {
  const baseUrl = `http://${config.envConfig.userService.host}:${config.envConfig.userService.port}`;
  
  return {
    mockLogin: (loginData: any, response: any) => {
      nock(baseUrl)
        .post('/auth/login', loginData)
        .reply(200, response);
    },

    mockLoginError: (loginData: any, error: any) => {
      nock(baseUrl)
        .post('/auth/login', loginData)
        .reply(401, error);
    },

    mockRefreshToken: (refreshData: any, response: any) => {
      nock(baseUrl)
        .post('/auth/refresh', refreshData)
        .reply(200, response);
    },

    mockRefreshTokenError: (refreshData: any, error: any) => {
      nock(baseUrl)
        .post('/auth/refresh', refreshData)
        .reply(401, error);
    },

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
