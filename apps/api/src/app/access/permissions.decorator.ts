import { SetMetadata } from '@nestjs/common';
import { PermissionAction } from '@turbovetnx/auth';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...actions: PermissionAction[]) =>
  SetMetadata(PERMISSIONS_KEY, actions);
