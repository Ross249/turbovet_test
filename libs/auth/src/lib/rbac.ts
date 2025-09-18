import { RoleName } from './roles';
import { PermissionAction, canPerform } from './permissions';

export interface OrgGraphNode {
  id: string;
  parentId: string | null;
}

export interface OrgGraph {
  nodes: OrgGraphNode[];
}

export function orgScopeForRole(
  role: RoleName,
  organizationId: string,
  graph: OrgGraph,
): Set<string> {
  const childMap = buildChildMap(graph.nodes);
  if (role === RoleName.Owner) {
    return new Set(childMap.keys());
  }

  const scoped = new Set<string>();
  const stack: string[] = [organizationId];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || scoped.has(current)) {
      continue;
    }
    scoped.add(current);
    for (const child of childMap.get(current) ?? []) {
      stack.push(child);
    }
  }
  return scoped;
}

function buildChildMap(nodes: OrgGraphNode[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const node of nodes) {
    if (!map.has(node.id)) {
      map.set(node.id, []);
    }
    if (!node.parentId) {
      continue;
    }
    const children = map.get(node.parentId) ?? [];
    children.push(node.id);
    map.set(node.parentId, children);
  }
  return map;
}

export function isWriteAction(action: PermissionAction): boolean {
  return (
    action === PermissionAction.TaskCreate ||
    action === PermissionAction.TaskUpdate ||
    action === PermissionAction.TaskDelete
  );
}

export function canViewAudit(role: RoleName): boolean {
  return canPerform(role, PermissionAction.AuditRead);
}
