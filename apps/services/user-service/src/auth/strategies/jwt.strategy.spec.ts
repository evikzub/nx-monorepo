import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AppConfigService } from '@microservices-app/shared/backend';
import { AuthTestingUtils } from '@microservices-app/shared/backend';
import { UserRole } from '@microservices-app/shared/types';

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
      // Arrange
      const testPayload = AuthTestingUtils.createTestPayload();

      // Act
      const result = await strategy.validate(testPayload);

      // Assert
      expect(result).toEqual(testPayload);
    });

    it('should throw UnauthorizedException for payload without sub', async () => {
      // Arrange
      const invalidPayload = AuthTestingUtils.createTestPayload();
      delete invalidPayload.sub;

      // Act & Assert
      await expect(strategy.validate(invalidPayload))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for payload without email', async () => {
      // Arrange
      const invalidPayload = AuthTestingUtils.createTestPayload();
      delete invalidPayload.email;

      // Act & Assert
      await expect(strategy.validate(invalidPayload))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should validate payload with different roles', async () => {
      // Arrange
      const adminPayload = AuthTestingUtils.createTestPayload({
        roles: [UserRole.ADMIN]
      });

      // Act
      const result = await strategy.validate(adminPayload);

      // Assert
      expect(result.roles).toContain(UserRole.ADMIN);
    });
  });
}); 