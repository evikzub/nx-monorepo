import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@microservices-app/shared/types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// export function Auth(...roles: UserRole[]) {
//   return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles));
// }
