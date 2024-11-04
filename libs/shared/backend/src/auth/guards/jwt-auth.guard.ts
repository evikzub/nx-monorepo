import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';
import { JwtPayload } from '@microservices-app/shared/types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = JwtPayload>(
    err: Error | null,
    user: TUser | false,
    info: JsonWebTokenError | undefined
  ): TUser {
    // Handle specific JWT errors
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('Invalid token');
    }

    // Handle other errors or missing user
    if (err || !user) {
      throw new UnauthorizedException();
    }

    return user;
  }
} 