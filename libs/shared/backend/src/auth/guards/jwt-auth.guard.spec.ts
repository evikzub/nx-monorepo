import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JsonWebTokenError } from 'jsonwebtoken';
import { AuthTestingUtils } from '../../testing/auth-testing.utils';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  describe('handleRequest', () => {
    it('should return user when valid', () => {
      // Arrange
      const testUser = AuthTestingUtils.createTestPayload();

      // Act
      const result = guard.handleRequest(null, testUser, undefined);

      // Assert
      expect(result).toBe(testUser);
    });

    it('should throw UnauthorizedException when token is invalid', () => {
      // Arrange
      const jwtError = new JsonWebTokenError('invalid token');

      // Act & Assert
      expect(() => guard.handleRequest(null, false, jwtError))
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is false', () => {
      // Act & Assert
      expect(() => guard.handleRequest(null, false, undefined))
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when error exists', () => {
      // Arrange
      const error = new Error('test error');

      // Act & Assert
      expect(() => guard.handleRequest(error, false, undefined))
        .toThrow(UnauthorizedException);
    });
  });
}); 