import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@microservices-app/shared/types';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    return data ? user?.[data] : user;
  },
); 