import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole, JwtPayload } from '@microservices-app/shared/types';
import { AppConfigService, AuthTestingUtils } from '../..';
import { JwtStrategy } from './jwt.strategy';

// Create a test type with optional properties
type TestJwtPayload = Partial<JwtPayload> & {
  roles?: UserRole[];
  firstName?: string;
  lastName?: string;
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  
  const mockConfigService = {
    envConfig: {
      jwt: {
        secret: 'test-secret',
        expiresIn: '1h'
      }
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AppConfigService,
          useValue: mockConfigService
        }
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should validate a valid payload', async () => {
      const testPayload = AuthTestingUtils.createTestPayload();
      const result = await strategy.validate(testPayload);
      expect(result).toEqual(testPayload);
    });

    it('should throw UnauthorizedException for payload without sub', async () => {
      const invalidPayload: TestJwtPayload = {
        email: 'test@example.com',
        roles: [UserRole.PUBLIC],
        type: 'access'
      };

      await expect(strategy.validate(invalidPayload as JwtPayload))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for payload without email', async () => {
      const invalidPayload: TestJwtPayload = {
        sub: '123',
        roles: [UserRole.PUBLIC],
        type: 'access'
      };

      await expect(strategy.validate(invalidPayload as JwtPayload))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should validate payload with different roles', async () => {
      const adminPayload = AuthTestingUtils.createTestPayload({
        roles: [UserRole.ADMIN]
      });

      const result = await strategy.validate(adminPayload);
      expect(result.roles).toContain(UserRole.ADMIN);
    });

    it('should handle optional fields correctly', async () => {
      const minimalPayload: JwtPayload = {
        sub: '123',
        email: 'test@example.com',
        roles: [UserRole.PUBLIC],
        type: 'access'
      };

      const result = await strategy.validate(minimalPayload);
      expect(result).toEqual(minimalPayload);
    });
  });
}); 