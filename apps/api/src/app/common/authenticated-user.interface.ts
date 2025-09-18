import { RoleName } from '@turbovetnx/auth';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  role: RoleName;
  organizationId: string;
  organizationPath: string;
}
