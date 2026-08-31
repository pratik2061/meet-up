import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './role.decorator';
import { UserRole } from 'src/schemas/user.schema';

interface RequestUserRole {
  user?: {
    role?: UserRole;
  };
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestUserRole>();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User doesnot have an assigned role');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('User doesnot have a valid role');
    }
    return true;
  }
}
