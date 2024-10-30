import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, loadConfiguration } from '@microservices-app/shared/backend';
import { UserRepository } from '../user.repository';
import { NewUser } from '@microservices-app/shared/types';

describe('UserRepository', () => {
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
      providers: [UserRepository],
    }).compile();

    // Initialize the module to trigger onModuleInit hooks
    await moduleRef.init();

    repository = moduleRef.get<UserRepository>(UserRepository);
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

  it('should create a user', async () => {
    const newUser: NewUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    const user = await repository.create(newUser);
    expect(user).toBeDefined();
    expect(user.email).toBe(newUser.email);
  });

  // Add more tests...
});
