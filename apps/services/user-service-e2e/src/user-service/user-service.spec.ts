import axios from 'axios';
import { RabbitMQTestHelper } from '../helpers/rabbitmq.helper';
import { EmailTestHelper } from '../helpers/email.helper';
import {
  NotificationType,
  NotificationPayload,
} from '@microservices-app/shared/types';
import { config } from 'dotenv';

// Load environment variables
process.env.SKIP_QUEUE = 'true';
config();

describe('UserService E2E', () => {
  let rabbitMQHelper: RabbitMQTestHelper;
  const API_URL = process.env.USER_SERVICE_URL || 'http://localhost:3010';
  const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  const NOTIFICATIONS_QUEUE =
    process.env.RABBITMQ_NOTIFICATIONS_QUEUE || 'notifications';

  beforeAll(async () => {
    jest.setTimeout(30000); 
    // Initialize RabbitMQ helper
    console.log('Connecting to RabbitMQ...');
    rabbitMQHelper = new RabbitMQTestHelper();
    await rabbitMQHelper.connect(RABBITMQ_URL);
    console.log('RabbitMQ connected');
  });

  beforeEach(() => {
    EmailTestHelper.clearSentEmails();
  });

  afterAll(async () => {
    //await rabbitMQHelper.cleanup();
    jest.setTimeout(10000); // Increase timeout for cleanup
    await rabbitMQHelper.cleanup();
    // Add delay to ensure cleanup completes
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Init test environment', () => {
    it('should initialize test environment', async () => {
      console.log('Initializing test environment...');
      console.log('API_URL -> ', API_URL);
    });
  });

  describe('User Registration Flow', () => {
    it('should create user and trigger verification email', async () => {
      jest.setTimeout(15000); // Increase timeout for this

      // 1. Create user
      const userData = {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roles: ['admin'],
      };

      console.log('Creating user...');
      //try {
        const createResponse = await axios.post(
          `${API_URL}/api/auth/register`,
          userData
        );
        //console.log('createResponse -> ', createResponse);
        expect(createResponse.status).toBe(201);
        expect(createResponse.data.user.email).toBe(userData.email);
        expect(createResponse.data.user.firstName).toBe(userData.firstName);

        console.log('Verifying user exists...');
        // 2. Verify user exists
        const getUserResponse = await axios.get(
          `${API_URL}/api/users/${createResponse.data.user.id}`,
          {
            headers: {
              Authorization: `Bearer ${createResponse.data.accessToken}`,
            },
          }
        );
        console.log('getUserResponse -> ', getUserResponse.data);
        expect(getUserResponse.status).toBe(200);
        expect(getUserResponse.data.email).toBe(userData.email);

        console.log('Waiting for message to be published...');
        // Wait a bit for message to be published
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Checking RabbitMQ message...');
        // Check RabbitMQ message
        const message = await rabbitMQHelper.getNextMessage(NOTIFICATIONS_QUEUE);
        expect(message).toBeDefined();
        if (!message) {
          throw new Error('No message received from queue');
        }// 3. Check RabbitMQ message
        // const message = await rabbitMQHelper.getNextMessage(
        //   NOTIFICATIONS_QUEUE
        // );

        const notification = message as NotificationPayload;
        console.log('notification -> ', notification);
        expect(notification.type).toBe(NotificationType.EMAIL_VERIFICATION);
        expect(notification.recipient).toBe(userData.email);
        expect(notification.data.firstName).toBe(userData.firstName);

        // 4. Wait for notification service to process
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 5. Verify email was sent
        const sentEmail = EmailTestHelper.getLastSentEmail();
        expect(sentEmail).toBeDefined();
        expect(sentEmail.to).toBe(userData.email);
        expect(sentEmail.subject).toContain('Verify');
      // } catch (error) {
      //   console.log('Error creating user -> ', error);
      // }
    }, 15000);

    it.skip('should handle duplicate email registration', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      // First registration
      const firstResponse = await axios.post(`${API_URL}/api/users`, userData);
      expect(firstResponse.status).toBe(201);

      // Second registration attempt
      try {
        await axios.post(`${API_URL}/api/users`, userData);
        fail('Should have thrown conflict error');
      } catch (error) {
        expect(error.response.status).toBe(409);
      }
    });

    it.skip('should validate user input', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: '123', // too short
        firstName: '',
        lastName: '',
      };

      try {
        await axios.post(`${API_URL}/api/users`, invalidUser);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('validation');
      }
    });
  });
});
