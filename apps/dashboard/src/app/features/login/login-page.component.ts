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
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { FluidModule } from 'primeng/fluid';
import { AvatarModule } from 'primeng/avatar';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    DividerModule,
    FloatLabelModule,
    InputIconModule,
    IconFieldModule,
    FluidModule,
    AvatarModule,
  ],
  template: `
    <main class="min-h-screen  flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-surface-900 mb-2">
            TurboVets Task Console
          </h1>
          <p class="text-sm text-surface-500">
            Sign in with your RBAC-enabled account.
          </p>
        </div>

        <p-card styleClass="rounded-lg shadow-lg p-8 border border-border">
          <form
            [formGroup]="form"
            (ngSubmit)="onSubmit()"
            class="flex flex-col gap-4"
          >
            <p-fluid>
              <div class="flex flex-col gap-2">
                <p-floatLabel>
                  <p-iconField iconPosition="left">
                    <p-inputIcon>
                      <i class="pi pi-envelope"></i>
                    </p-inputIcon>
                    <input
                      pInputText
                      type="email"
                      id="login-email"
                      formControlName="email"
                      autocomplete="username"
                      class="w-full"
                      [ngClass]="{
                        'p-invalid':
                          form.controls.email.invalid &&
                          form.controls.email.touched
                      }"
                    />
                  </p-iconField>
                  <label for="login-email">Email</label>
                </p-floatLabel>
                <small
                  *ngIf="
                    form.controls.email.invalid && form.controls.email.touched
                  "
                  class="text-xs text-red-500"
                >
                  Enter a valid email address.
                </small>
              </div>

              <div class="mt-2 flex flex-col gap-2">
                <p-floatLabel>
                  <p-iconField iconPosition="left">
                    <p-inputIcon>
                      <i class="pi pi-lock"></i>
                    </p-inputIcon>
                    <p-password
                      formControlName="password"
                      inputId="login-password"
                      [feedback]="false"
                      toggleMask
                      autocomplete="current-password"
                      class="w-full"
                      [inputStyleClass]="
                        form.controls.password.invalid &&
                        form.controls.password.touched
                          ? 'p-invalid w-full'
                          : 'w-full'
                      "
                    ></p-password>
                  </p-iconField>
                  <label for="login-password">Password</label>
                </p-floatLabel>
                <small
                  *ngIf="
                    form.controls.password.invalid &&
                    form.controls.password.touched
                  "
                  class="text-xs text-red-500"
                >
                  Password must be at least 8 characters long.
                </small>
              </div>
            </p-fluid>

            <button
              pButton
              type="button"
              class="w-full"
              [loading]="vm().status === 'authenticating'"
              [disabled]="vm().status === 'authenticating'"
              (click)="onSubmit()"
            >
              <span class="pi pi-sign-in mr-2" aria-hidden="true"></span>
              <span class="p-button-label">Sign in</span>
            </button>
          </form>

          <p-message
            *ngIf="vm().error"
            severity="error"
            [text]="vm().error!"
            styleClass="mt-4"
          ></p-message>

          <p-divider align="center" type="dashed" styleClass="mt-6">
            <span class="text-xs uppercase tracking-wide text-surface-500"
              >Demo credentials</span
            >
          </p-divider>
          <ul class="mt-3 space-y-2 text-sm text-surface-600">
            <li>
              <span class="font-medium text-surface-900">Owner</span>:
              owner@turbovets.test / ChangeMe123!
            </li>
            <li>
              <span class="font-medium text-surface-900">Admin</span>:
              admin@turbovets.test / ChangeMe123!
            </li>
            <li>
              <span class="font-medium text-surface-900">Viewer</span>:
              viewer@turbovets.test / ChangeMe123!
            </li>
          </ul>
        </p-card>
      </div>
    </main>
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
    { initialValue: { status: 'idle', error: null } }
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
