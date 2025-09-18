import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { AuthPayload } from '@turbovetnx/data';

export interface AuthState {
  user: AuthPayload['user'] | null;
  token: string | null;
  status: 'idle' | 'authenticating' | 'authenticated' | 'error';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,
    on(AuthActions.login, (state) => ({
      ...state,
      status: 'authenticating',
      error: null,
    })),
    on(AuthActions.loginSuccess, (state, { session }) => ({
      ...state,
      status: 'authenticated',
      user: session.user,
      token: session.accessToken,
      error: null,
    })),
    on(AuthActions.loginFailure, (state, { error }) => ({
      ...state,
      status: 'error',
      error,
    })),
    on(AuthActions.restoreSessionSuccess, (state, { session }) => ({
      ...state,
      status: 'authenticated',
      user: session.user,
      token: session.accessToken,
      error: null,
    })),
    on(AuthActions.logout, () => initialState),
  ),
  extraSelectors: ({ selectToken }) => ({
    selectIsAuthenticated: createSelector(selectToken, (token) => token !== null),
  }),
});

export const {
  name: authFeatureKey,
  reducer: authReducer,
  selectAuthState,
  selectUser,
  selectToken,
  selectStatus,
  selectError,
} = authFeature;
