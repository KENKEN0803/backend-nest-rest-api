import { UserRole } from '../../users/entity/user.entity';
import { SetMetadata } from '@nestjs/common';

export type AllowedRoles = keyof typeof UserRole ;

export const Role = (roles: AllowedRoles[]) => SetMetadata('role', roles);
