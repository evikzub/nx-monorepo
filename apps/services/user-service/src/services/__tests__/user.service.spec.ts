import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from '../user.service';
import { UserRepository } from '../../repositories/user.repository';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, loadConfiguration } from '@microservices-app/shared/backend';
import { NewUser } from '@microservices-app/shared/types';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [loadConfiguration],
        }),
        DatabaseModule,
      ],
      providers: [UserService, UserRepository],
    }).compile();

    // Initialize the module to trigger onModuleInit hooks
    await moduleRef.init();

    service = moduleRef.get<UserService>(UserService);
    repository = moduleRef.get<UserRepository>(UserRepository);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    try {
      const users = await repository.findAll();
      if (users.length > 0) {
        await Promise.all(users.map(user => repository.hardDelete(user.id)));
      }
    } catch (error) {
      console.error('Error cleaning up database:', error);
      throw error;
    }
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser: NewUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const user = await service.createUser(newUser);
      expect(user).toBeDefined();
      expect(user.email).toBe(newUser.email);
      expect(user.password).not.toBe(newUser.password); // Password should be hashed
    });

    it('should throw ConflictException for duplicate email', async () => {
      const newUser: NewUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await expect(service.createUser(newUser)).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const user = await service.validateUser('test@example.com', 'password123');
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null for invalid credentials', async () => {
      const user = await service.validateUser('test@example.com', 'wrongpassword');
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      const user = await service.findUserByEmail('test@example.com');
      if (!user) throw new Error('Test user not found');

      const updatedUser = await service.updateUser(user.id, {
        firstName: 'Updated',
        lastName: 'Name',
      });

      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
    });

    it('should throw NotFoundException for non-existent user', async () => {
      await expect(
        service.updateUser('non-existent-id', { firstName: 'Test' })
      ).rejects.toThrow(NotFoundException);
    });
  });
}); 