import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService, DatabaseModule, loadConfiguration, RabbitMQService } from '@microservices-app/shared/backend';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UserRepository } from '../../repositories/user.repository';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  userResponseSchema 
} from '@microservices-app/shared/types';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserController Integration Tests', () => {
  const email = 'test.controller@example.com';
  const duplicateEmail = 'duplicate.controller@example.com';
    
  let controller: UserController;
  //let service: UserService;
  let repository: UserRepository;
  let moduleRef: TestingModule;

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
      controllers: [UserController],
      providers: [UserService, UserRepository, AppConfigService,
        {
          provide: RabbitMQService,
          useValue: mockRabbitMQService,
        },
      ],
    }).compile();

    await moduleRef.init();

    //controller = moduleRef.get<UserController>(UserController);
    controller = await moduleRef.resolve(UserController);
    //service = moduleRef.get<UserService>(UserService);
    repository = moduleRef.get<UserRepository>(UserRepository);
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
    try {
      await deleteUser(email);
      await deleteUser(duplicateEmail);
    } catch (error) {
      console.error('Error cleaning up database:', error);
      throw error;
    }
  });

  const transformResponse = (data: unknown) => {
    return userResponseSchema.parse(data);
  };

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await controller.createUser(createUserDto);
      expect(response).toHaveProperty('password');

      const user = transformResponse(response);

      expect(user).toBeDefined();
      expect(user.email).toBe(createUserDto.email);
      expect(user.firstName).toBe(createUserDto.firstName);
      expect(user.lastName).toBe(createUserDto.lastName);
      expect(user).not.toHaveProperty('password');
    });

    it('should throw ConflictException for duplicate email', async () => {
      const createUserDto: CreateUserDto = {
        email: duplicateEmail,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      // Create first user
      await controller.createUser(createUserDto);

      // Try to create duplicate
      await expect(controller.createUser(createUserDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('findUser', () => {
    it('should find a user by id', async () => {
      const createUserDto: CreateUserDto = {
        email, //'find@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };
      
      const createdResponse = await controller.createUser(createUserDto);
      const createdUser = transformResponse(createdResponse);

      const response = await controller.findUser(createdUser.id);
      const user = transformResponse(response);
      
      expect(user).toBeDefined();
      expect(user.id).toBe(createdUser.id);
      expect(user.email).toBe(createUserDto.email);
      expect(user).not.toHaveProperty('password');
    });

    it('should throw NotFoundException for non-existent user', async () => {
      await expect(
        controller.findUser('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      const createUserDto: CreateUserDto = {
        email, //'update@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };
      
      const createdResponse = await controller.createUser(createUserDto);
      const createdUser = transformResponse(createdResponse);

      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const response = await controller.updateUser(createdUser.id, updateUserDto);
      const user = transformResponse(response);
      
      expect(user.firstName).toBe(updateUserDto.firstName);
      expect(user.lastName).toBe(updateUserDto.lastName);
      expect(user).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
      };

      await expect(
        controller.updateUser(
          '00000000-0000-0000-0000-000000000000',
          updateUserDto
        )
      ).rejects.toThrow(NotFoundException);
    });
  });
});
