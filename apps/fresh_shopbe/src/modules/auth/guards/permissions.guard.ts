import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user }: { user: User } = context.switchToHttp().getRequest();

    if (!user || !user.role || !user.role.permissions) {
      return false;
    }

    const userPermissions = user.role.permissions.map(
      (permission) => `${permission.resource}:${permission.action}`,
    );

    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }
}
