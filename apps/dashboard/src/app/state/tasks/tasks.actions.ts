import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  CreateTaskRequest,
  TaskDto,
  TaskFilter,
  UpdateTaskRequest,
} from '@turbovetnx/data';
import { TaskSortOption } from './task-sort.model';

export const TasksActions = createActionGroup({
  source: 'Tasks',
  events: {
    'Load Tasks': props<{ filter: TaskFilter }>(),
    'Load Tasks Success': props<{ tasks: TaskDto[] }>(),
    'Load Tasks Failure': props<{ error: string }>(),
    'Create Task': props<{ request: CreateTaskRequest }>(),
    'Create Task Success': props<{ task: TaskDto }>(),
    'Create Task Failure': props<{ error: string }>(),
    'Update Task': props<{ taskId: string; changes: UpdateTaskRequest }>(),
    'Update Task Success': props<{ task: TaskDto }>(),
    'Update Task Failure': props<{ error: string }>(),
    'Delete Task': props<{ taskId: string }>(),
    'Delete Task Success': props<{ taskId: string }>(),
    'Delete Task Failure': props<{ error: string }>(),
    'Set Filters': props<{ filter: TaskFilter }>(),
    'Set Sort': props<{ sort: TaskSortOption }>(),
    'Reset State': emptyProps(),
  },
});
