import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from './state/auth/auth.actions';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
  private readonly store = inject(Store);

  constructor() {
    this.store.dispatch(AuthActions.restoreSession());
  }
}
