import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionAction, canPerform } from '@turbovetnx/auth';
import { AuthenticatedUser } from '../common/authenticated-user.interface';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<
      PermissionAction[] | undefined
    >(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const allowed = required.every((action) => canPerform(user.role, action));
    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
