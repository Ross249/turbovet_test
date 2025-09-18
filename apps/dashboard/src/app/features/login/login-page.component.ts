import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../state/auth/auth.actions';
import {
  selectAuthError,
  selectAuthStatus,
} from '../../state/auth/auth.selectors';
import { combineLatest } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white px-4 py-12">
      <div class="w-full max-w-md rounded-2xl border border-sky-100 bg-white p-8 shadow-xl shadow-sky-100/80">
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-semibold text-slate-900">TurboVets Task Console</h1>
          <p class="mt-2 text-sm text-slate-600">Sign in with your RBAC-enabled account.</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="login-email" class="block text-sm font-medium text-slate-600">Email</label>
            <input
              type="email"
              formControlName="email"
              id="login-email"
              class="mt-2 w-full rounded-lg border border-sky-200 bg-white px-4 py-2 text-slate-900 focus:border-primary-400 focus:ring-primary-400"
              placeholder="you@turbovets.test"
              autocomplete="username"
            />
          </div>
          <div>
            <label for="login-password" class="block text-sm font-medium text-slate-600">Password</label>
            <input
              type="password"
              formControlName="password"
              id="login-password"
              class="mt-2 w-full rounded-lg border border-sky-200 bg-white px-4 py-2 text-slate-900 focus:border-primary-400 focus:ring-primary-400"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>
          <button
            type="submit"
            [disabled]="form.invalid || vm()?.status === 'authenticating'"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2 text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-primary-200"
          >
            <span *ngIf="vm()?.status !== 'authenticating'">Sign in</span>
            <span *ngIf="vm()?.status === 'authenticating'" class="flex items-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Authenticating…
            </span>
          </button>
        </form>
        <p *ngIf="vm()?.error" class="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ vm()?.error }}
        </p>
        <div class="mt-6 text-xs text-slate-500">
          <p>Demo credentials:</p>
          <ul class="mt-2 space-y-1">
            <li><span class="font-medium text-slate-700">Owner</span>: owner@turbovets.test / ChangeMe123!</li>
            <li><span class="font-medium text-slate-700">Admin</span>: admin@turbovets.test / ChangeMe123!</li>
            <li><span class="font-medium text-slate-700">Viewer</span>: viewer@turbovets.test / ChangeMe123!</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  protected readonly vm = toSignal(
    combineLatest({
      status: this.store.select(selectAuthStatus),
      error: this.store.select(selectAuthError),
    }),
    { initialValue: { status: 'idle', error: null } },
  );

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.store.dispatch(AuthActions.login({ email, password }));
  }
}
