import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthActions } from './auth.actions';
import { AuthApiService } from '../../core/api/auth-api.service';
import { AuthStorageService } from '../../core/services/auth-storage.service';
import { TasksActions } from '../tasks/tasks.actions';
import {
  catchError,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { AuthPayload } from '@turbovetnx/data';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(AuthApiService);
  private readonly storage = inject(AuthStorageService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.api.login({ email, password }).pipe(
          map((session) => AuthActions.loginSuccess({ session })),
          catchError((error: Error) =>
            of(
              AuthActions.loginFailure({
                error: error.message ?? 'Invalid credentials',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  restoreSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.restoreSession),
      map(() => this.storage.load()),
      mergeMap((stored) => {
        if (!stored) {
          return of(AuthActions.logout());
        }
        const expiresIn = Math.max(
          Math.floor((stored.expiresAt - Date.now()) / 1000),
          60,
        );
        const session: AuthPayload = {
          accessToken: stored.token,
          user: stored.user,
          expiresIn,
        };
        return of(AuthActions.restoreSessionSuccess({ session }));
      }),
    ),
  );

  persistSession$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ session }) => this.storage.save(session)),
      ),
    { dispatch: false },
  );

  hydrateAfterRestore$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.restoreSessionSuccess),
        tap(({ session }) => this.storage.save(session)),
      ),
    { dispatch: false },
  );

  navigateOnAuth$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.restoreSessionSuccess),
        tap(() => {
          void this.router.navigateByUrl('/');
        }),
      ),
    { dispatch: false },
  );

  loadTasksOnAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.restoreSessionSuccess),
      map(() => TasksActions.loadTasks({ filter: {} })),
    ),
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => this.storage.clear()),
      tap(() => {
        void this.router.navigateByUrl('/login');
      }),
      map(() => TasksActions.resetState()),
    ),
  );

}
