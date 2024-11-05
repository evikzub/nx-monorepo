import { JwtService } from '@nestjs/jwt';
import { JwtPayload, UserRole } from '@microservices-app/shared/types';

export class AuthTestingUtils {
  static createTestToken(
    jwtService: JwtService,
    payload: Partial<JwtPayload> = {},
    options: { expiresIn?: string | number } = {}
  ): string {
    const defaultPayload: JwtPayload = {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      roles: [UserRole.PUBLIC],
      firstName: 'Test',
      lastName: 'User',
      type: 'access',
      ...payload
    };

    return jwtService.sign(defaultPayload, options);
  }

  static createTestPayload(override: Partial<JwtPayload> = {}): JwtPayload {
    return {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      roles: [UserRole.PUBLIC],
      firstName: 'Test',
      lastName: 'User',
      type: 'access',
      ...override
    };
  }
 
  static createExpiredToken(
    jwtService: JwtService,
    payload: Partial<JwtPayload> = {}
  ): string {
    // Create a new JWT service instance with expired token settings
    const expiredJwtService = new JwtService({
        secret: 'test-secret',
        signOptions: {
            expiresIn: '-1h' // Token that expired 1 hour ago
        }
        });

    return this.createTestToken(expiredJwtService, payload);
  }

  static createTokenWithoutExpiration(
    jwtService: JwtService,
    payload: Partial<JwtPayload> = {}
  ): string {
    return this.createTestToken(jwtService, payload, {});
  }

  static createTokenForUser(
    jwtService: JwtService,
    user: { id: string; email: string; roles: UserRole[]; firstName?: string; lastName?: string }
  ): string {
    return this.createTestToken(jwtService, {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      firstName: user.firstName,
      lastName: user.lastName
    });
  }

  static decodeToken(token: string): JwtPayload {
    const base64Payload = token.split('.')[1];
    const payloadBuffer = Buffer.from(base64Payload, 'base64');
    return JSON.parse(payloadBuffer.toString());
  }

  static verifyToken(
    jwtService: JwtService,
    token: string
  ) {
    try {
      return jwtService.verify(token);
    } catch {
        //console.log('token error', error);
        return null;
    }
  }
} 