import { orgScopeForRole, isWriteAction, canViewAudit } from './rbac';
import { RoleName } from './roles';
import { PermissionAction } from './permissions';

const graph = {
  nodes: [
    { id: 'root', parentId: null },
    { id: 'child-a', parentId: 'root' },
    { id: 'child-b', parentId: 'root' },
  ],
};

describe('RBAC helpers', () => {
  it('expands owner scope across all organizations', () => {
    const scope = orgScopeForRole(RoleName.Owner, 'child-a', graph);
    expect(scope.has('root')).toBe(true);
    expect(scope.has('child-b')).toBe(true);
  });

  it('limits admin scope to descendants', () => {
    const scope = orgScopeForRole(RoleName.Admin, 'child-a', graph);
    expect(scope.has('child-a')).toBe(true);
    expect(scope.has('child-b')).toBe(false);
  });

  it('classifies write operations correctly', () => {
    expect(isWriteAction(PermissionAction.TaskCreate)).toBe(true);
    expect(isWriteAction(PermissionAction.TaskRead)).toBe(false);
  });

  it('allows audit log access for privileged roles', () => {
    expect(canViewAudit(RoleName.Owner)).toBe(true);
    expect(canViewAudit(RoleName.Viewer)).toBe(false);
  });
});
