import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import { User } from 'src/auth/entities/user.entity';
import { ROLES } from 'src/auth/decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) { }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(ROLES, context.getHandler());

    if (!validRoles || validRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) throw new BadRequestException('User not found in headers');

    for (const role of user.roles) {
      if (validRoles.includes(role))
        return true;
    }

    throw new ForbiddenException(`User ${user.fullName} needs a valid role to access resource: [${validRoles}]`);
  }
}
