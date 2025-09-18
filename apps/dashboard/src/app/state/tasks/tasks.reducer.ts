import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { TasksActions } from './tasks.actions';
import { TaskDto, TaskFilter } from '@turbovetnx/data';

export interface TasksState extends EntityState<TaskDto> {
  loading: boolean;
  error: string | null;
  filter: TaskFilter;
}

const adapter = createEntityAdapter<TaskDto>({
  selectId: (task) => task.id,
  sortComparer: (a, b) => a.updatedAt.localeCompare(b.updatedAt) * -1,
});

const initialState: TasksState = adapter.getInitialState({
  loading: false,
  filter: {},
  error: null,
});

export const tasksFeature = createFeature({
  name: 'tasks',
  reducer: createReducer(
    initialState,
    on(TasksActions.resetState, () => initialState),
    on(TasksActions.setFilters, (state, { filter }) => ({
      ...state,
      filter,
    })),
    on(TasksActions.loadTasks, (state, { filter }) => ({
      ...state,
      loading: true,
      error: null,
      filter,
    })),
    on(TasksActions.loadTasksSuccess, (state, { tasks }) =>
      adapter.setAll(tasks, {
        ...state,
        loading: false,
      }),
    ),
    on(TasksActions.loadTasksFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(TasksActions.createTaskSuccess, (state, { task }) =>
      adapter.addOne(task, state),
    ),
    on(TasksActions.updateTaskSuccess, (state, { task }) =>
      adapter.upsertOne(task, state),
    ),
    on(TasksActions.deleteTaskSuccess, (state, { taskId }) =>
      adapter.removeOne(taskId, state),
    ),
  ),
  extraSelectors: ({ selectTasksState }) => adapter.getSelectors(selectTasksState),
});

export const {
  name: tasksFeatureKey,
  reducer: tasksReducer,
  selectTasksState,
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = tasksFeature;

export const {
  selectAll: selectAllTasks,
} = adapter.getSelectors(selectTasksState);
