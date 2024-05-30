import { SetMetadata } from '@nestjs/common';

import { ValidRoles } from '../interfaces';

export const ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) => SetMetadata('role-protected', args);
