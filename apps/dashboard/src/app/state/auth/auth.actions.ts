import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthPayload } from '@turbovetnx/data';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ email: string; password: string }>(),
    'Login Success': props<{ session: AuthPayload }>(),
    'Login Failure': props<{ error: string }>(),
    'Restore Session': emptyProps(),
    'Restore Session Success': props<{ session: AuthPayload }>(),
    Logout: emptyProps(),
  },
});
