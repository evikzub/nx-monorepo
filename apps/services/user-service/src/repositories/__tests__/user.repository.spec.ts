import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import {
  DatabaseModule,
  loadConfiguration,
} from '@microservices-app/shared/backend';
import { UserRepository } from '../user.repository';
import { NewUser, NotFoundError, UserRole } from '@microservices-app/shared/types';

describe('UserRepository', () => {
  const email = 'test.repository@example.com';

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
      const user = await repository.findByEmail(email, true);
      if (user) {
        try {
          await repository.hardDelete(user.id);
        } catch (error) {
          // Ignore NotFoundError during cleanup
          if (!(error instanceof NotFoundError)) {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up database:', error);
      throw error;
    }
  });

  it('should create a user', async () => {
    const newUser: NewUser = {
      email,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      roles: [UserRole.ADMIN]
    };

    const user = await repository.create(newUser);
    expect(user).toBeDefined();
    expect(user.email).toBe(newUser.email);
    expect(user.roles).toEqual([UserRole.ADMIN]);
  });
  // Add more tests...
});
