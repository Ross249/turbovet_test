import { RoleName, ROLE_INHERITANCE } from './roles';

export enum PermissionAction {
  TaskCreate = 'TASK_CREATE',
  TaskRead = 'TASK_READ',
  TaskUpdate = 'TASK_UPDATE',
  TaskDelete = 'TASK_DELETE',
  AuditRead = 'AUDIT_READ',
}

const BASE_MATRIX: Record<RoleName, readonly PermissionAction[]> = {
  [RoleName.Owner]: [
    PermissionAction.TaskCreate,
    PermissionAction.TaskRead,
    PermissionAction.TaskUpdate,
    PermissionAction.TaskDelete,
    PermissionAction.AuditRead,
  ],
  [RoleName.Admin]: [
    PermissionAction.TaskCreate,
    PermissionAction.TaskRead,
    PermissionAction.TaskUpdate,
    PermissionAction.TaskDelete,
    PermissionAction.AuditRead,
  ],
  [RoleName.Viewer]: [PermissionAction.TaskRead],
};

export function permissionsForRole(role: RoleName): Set<PermissionAction> {
  const inheritedRoles = ROLE_INHERITANCE[role] ?? [];
  const permissions = new Set<PermissionAction>();
  for (const inherited of inheritedRoles) {
    const actions = BASE_MATRIX[inherited] ?? [];
    for (const action of actions) {
      permissions.add(action);
    }
  }
  return permissions;
}

export function canPerform(role: RoleName, action: PermissionAction): boolean {
  return permissionsForRole(role).has(action);
}
