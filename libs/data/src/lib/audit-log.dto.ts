export enum AuditAction {
  TaskCreate = 'TASK_CREATE',
  TaskUpdate = 'TASK_UPDATE',
  TaskDelete = 'TASK_DELETE',
  TaskView = 'TASK_VIEW',
  Login = 'LOGIN',
  Logout = 'LOGOUT',
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: AuditAction;
  resourceId: string;
  resourceType: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
