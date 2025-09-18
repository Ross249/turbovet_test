export enum TaskStatus {
  Backlog = 'BACKLOG',
  InProgress = 'IN_PROGRESS',
  Blocked = 'BLOCKED',
  Completed = 'COMPLETED',
}

export enum TaskPriority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
}

export interface TaskDto {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: TaskStatus;
  priority: TaskPriority;
  organizationId: string;
  assigneeId?: string;
  dueDate?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  category?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  organizationId: string;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  organizationId?: string;
  assigneeId?: string;
  dueDate?: string;
}

export interface TaskFilter {
  status?: TaskStatus;
  category?: string;
  search?: string;
  priority?: TaskPriority;
}
