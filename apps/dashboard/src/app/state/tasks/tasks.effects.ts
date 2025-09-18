import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TasksActions } from './tasks.actions';
import { TasksApiService } from '../../core/api/tasks-api.service';
import { catchError, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectTasksFilter } from './tasks.selectors';

@Injectable()
export class TasksEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(TasksApiService);
  private readonly store = inject(Store);

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTasks),
      switchMap(({ filter }) =>
        this.api.list(filter).pipe(
          map((tasks) => TasksActions.loadTasksSuccess({ tasks })),
          catchError((error: Error) =>
            of(
              TasksActions.loadTasksFailure({
                error: error.message ?? 'Failed to load tasks',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.createTask),
      mergeMap(({ request }) =>
        this.api.create(request).pipe(
          map((task) => TasksActions.createTaskSuccess({ task })),
          catchError((error: Error) =>
            of(
              TasksActions.createTaskFailure({
                error: error.message ?? 'Failed to create task',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTask),
      mergeMap(({ taskId, changes }) =>
        this.api.update(taskId, changes).pipe(
          map((task) => TasksActions.updateTaskSuccess({ task })),
          catchError((error: Error) =>
            of(
              TasksActions.updateTaskFailure({
                error: error.message ?? 'Failed to update task',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.deleteTask),
      mergeMap(({ taskId }) =>
        this.api.remove(taskId).pipe(
          map(() => TasksActions.deleteTaskSuccess({ taskId })),
          catchError((error: Error) =>
            of(
              TasksActions.deleteTaskFailure({
                error: error.message ?? 'Failed to delete task',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  refreshAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        TasksActions.createTaskSuccess,
        TasksActions.updateTaskSuccess,
        TasksActions.deleteTaskSuccess,
      ),
      withLatestFrom(this.store.select(selectTasksFilter)),
      map(([, filter]) => TasksActions.loadTasks({ filter })),
    ),
  );
}
