import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from '../user.service';
import { UserRepository } from '../../repositories/user.repository';
import { ConfigModule } from '@nestjs/config';
import {
  AppConfigService,
  DatabaseModule,
  loadConfiguration,
  RabbitMQService,
} from '@microservices-app/shared/backend';
import { NewUser, NotificationRoutingKey, UserRole } from '@microservices-app/shared/types';

describe('UserService', () => {
  const email = 'test.service@example.com';
  const duplicateEmail = 'duplicate.service@example.com';
  let service: UserService;
  let repository: UserRepository;
  //let rabbitMQService: RabbitMQService;
  let moduleRef: TestingModule;
  let config: AppConfigService;

  // Create mock for RabbitMQService
  const mockRabbitMQService = {
    publishExchange: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [loadConfiguration],
        }),
        DatabaseModule,
      ],
      providers: [UserService, UserRepository, AppConfigService,
        {
          provide: RabbitMQService,
          useValue: mockRabbitMQService,
        },
      ],
    }).compile();

    await moduleRef.init();

    service = moduleRef.get<UserService>(UserService);
    repository = moduleRef.get<UserRepository>(UserRepository);
    //rabbitMQService = moduleRef.get<RabbitMQService>(RabbitMQService);
    config = moduleRef.get<AppConfigService>(AppConfigService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  async function deleteUser(email: string) {
    const user = await repository.findByEmail(email, true);
    if (user) {
      await repository.hardDelete(user.id);
    }
  }

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clean up database before each test
    try {
      await deleteUser(email);
      await deleteUser(duplicateEmail); 
    } catch (error) {
      console.error('Error cleaning up database:', error);
      throw error;
    }
  });

  // Add this test to verify the notification is sent
  describe('createUser with notification', () => {
    it('should create user and send verification email', async () => {
        const newUser: NewUser = {
          email,
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          roles: [UserRole.PUBLIC]
        };
  
        const user = await service.createUser(newUser);
  
        // Verify user was created
        expect(user).toBeDefined();
        expect(user.email).toBe(newUser.email);
  
        // Verify notification was sent
        expect(mockRabbitMQService.publishExchange).toHaveBeenCalledTimes(1);
        expect(mockRabbitMQService.publishExchange).toHaveBeenCalledWith(
          config.envConfig.rabbitmq.exchanges.notifications,
          NotificationRoutingKey.EMAIL_VERIFICATION,
          expect.objectContaining({
            type: 'EMAIL_VERIFICATION',
            recipient: email,
            templateId: 'email-verification',
            data: expect.objectContaining({
              firstName: 'Test',
              verificationUrl: expect.stringContaining('verify-email?token=')
            })
          })
        );
      });
  
      it('should handle notification failure gracefully', async () => {
        // Mock the publishQueue to fail
        mockRabbitMQService.publishExchange.mockRejectedValueOnce(new Error('Queue error'));
  
        const newUser: NewUser = {
          email,
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          roles: [UserRole.PUBLIC]
        };
  
        // The creation should still succeed even if notification fails
        //const user = await service.createUser(newUser);
        const user = await service.createUser(newUser).catch(error => {
          // This should not happen - we expect the function to succeed
          fail('User creation should not fail when notification fails: ' + error.message);
        });

        // Verify user was created successfully
        expect(user).toBeDefined();
        expect(user.email).toBe(newUser.email);

        // Verify the notification was attempted
        expect(mockRabbitMQService.publishExchange).toHaveBeenCalledTimes(1);
      });
    });
  
  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser: NewUser = {
        email,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roles: [UserRole.PUBLIC]
      };

      const user = await service.createUser(newUser);
      expect(user).toBeDefined();
      expect(user.email).toBe(newUser.email);
      expect(user.password).not.toBe(newUser.password); // Password should be hashed
    });

    it('should throw ConflictException for duplicate email', async () => {
      const newUser: NewUser = {
        email,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roles: [UserRole.PUBLIC]
      };

      // Create first user
      await expect(service.createUser(newUser)).resolves.not.toThrow();

      // Try to create duplicate
      await expect(service.createUser(newUser)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      // Create user
      await service.createUser({
        email,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roles: [UserRole.PUBLIC]
      });
      const user = await service.validateUser(email, 'password123');
      expect(user).toBeDefined();
      expect(user?.email).toBe(email);
    });

    it('should return null for invalid credentials', async () => {
      const user = await service.validateUser(email, 'wrongpassword');
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      // Create user
      await service.createUser({
        email,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roles: [UserRole.PUBLIC]
      });
      // Find user
      const user = await service.findUserByEmail(email);
      if (!user) throw new Error('Test user not found');

      // Update user
      const updatedUser = await service.updateUser(user.id, {
        firstName: 'Updated',
        lastName: 'Name',
      });

      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const nonExistentId = '462253ea-2877-4039-9b9d-8b5758893808';
      // Try to update non-existent user
      await expect(
        service.updateUser(nonExistentId, { firstName: 'Test' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for deleted user', async () => {
      // Create user
      const user = await service.createUser({
        email,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roles: [UserRole.PUBLIC]
      });
      expect(user).toBeDefined();
      
      // Delete user
      await service.deleteUser(user.id);

      // Try to update deleted user
      await expect(
        service.updateUser(user.id, { firstName: 'Test' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email already exists', async () => {
      // Create user
      const user = await service.createUser({
        email,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roles: [UserRole.PUBLIC]
      });
      expect(user).toBeDefined();

      // Create duplicate user
      const duplicateUser = await service.createUser({
        email: duplicateEmail,
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User',
        roles: [UserRole.PUBLIC]
      })
      expect(duplicateUser).toBeDefined();
      
      // Try to update user with duplicate email
      await expect(
        service.updateUser(user.id, { email: duplicateEmail })
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException for deleted user', async () => {
      const nonExistentId = '462253ea-2877-4039-9b9d-8b5758893808';
      // Try to update non-existent user
      await expect(service.updateUser(nonExistentId, { firstName: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      // Create user
      const user = await service.createUser({
        email,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roles: [UserRole.PUBLIC]
      });

      expect(user).toBeDefined();

      // Delete user
      await service.deleteUser(user.id);

      // Find user
      const deletedUser = await service.findUserByEmail(email);
      expect(deletedUser).toBeNull();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const nonExistentId = '462253ea-2877-4039-9b9d-8b5758893808';
      // Try to delete non-existent user
      await expect(service.deleteUser(nonExistentId)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
