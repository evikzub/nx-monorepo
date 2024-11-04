import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@microservices-app/shared/types';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// export function Auth(...roles: UserRole[]) {
//   return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles));
// }
