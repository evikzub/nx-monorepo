import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '@microservices-app/shared/types';
import { AppConfigService } from '@microservices-app/shared/backend';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: AppConfigService) {
    super({
      // Extract JWT from Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Automatically reject expired tokens
      ignoreExpiration: false,
      // JWT signing secret
      secretOrKey: config.envConfig.jwt.secret,
    });
  }

  // Passport will call this method to verify and transform the payload
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Verify payload has required fields
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // You can add additional validation here, like checking if user still exists
    return payload;
  }
} 