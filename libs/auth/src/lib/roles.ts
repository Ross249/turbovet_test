export enum RoleName {
  Owner = 'OWNER',
  Admin = 'ADMIN',
  Viewer = 'VIEWER',
}

export const ROLE_INHERITANCE: Record<RoleName, RoleName[]> = {
  [RoleName.Owner]: [RoleName.Owner, RoleName.Admin, RoleName.Viewer],
  [RoleName.Admin]: [RoleName.Admin, RoleName.Viewer],
  [RoleName.Viewer]: [RoleName.Viewer],
};

export function normalizeRole(value: string): RoleName {
  const upper = value.trim().toUpperCase();
  switch (upper) {
    case RoleName.Owner:
      return RoleName.Owner;
    case RoleName.Admin:
      return RoleName.Admin;
    case RoleName.Viewer:
      return RoleName.Viewer;
    default:
      throw new Error(`Unsupported role: ${value}`);
  }
}

export function isRoleAtLeast(role: RoleName, minimum: RoleName): boolean {
  return ROLE_INHERITANCE[role]?.includes(minimum) ?? false;
}
