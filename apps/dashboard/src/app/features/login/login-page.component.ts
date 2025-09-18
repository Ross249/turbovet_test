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
    <main
      style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:1rem;"
    >
      <div style="width:100%; max-width:28rem;">
        <div style="text-align:center; margin-bottom:2rem;">
          <h1
            style="font-size:1.875rem; line-height:2.25rem; font-weight:700; color:rgb(17 24 39); margin-bottom:0.5rem;"
          >
            TurboVets Task Console
          </h1>
          <p
            style="font-size:0.875rem; line-height:1.25rem; color:rgb(107 114 128);"
          >
            Sign in with your RBAC-enabled account.
          </p>
        </div>

        <p-card
          [style]="{
            'border-radius': '0.5rem',
            'box-shadow':
              '0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1)',
            padding: '2rem',
            border: '1px solid rgb(229 231 235)'
          }"
        >
          <form
            [formGroup]="form"
            (ngSubmit)="onSubmit()"
            style="display:flex; flex-direction:column; gap:1rem;"
          >
            <p-fluid>
              <div style="display:flex; flex-direction:column; gap:0.5rem;">
                <p-floatLabel>
                  <p-iconField iconPosition="left">
                    <input
                      pInputText
                      type="email"
                      id="login-email"
                      formControlName="email"
                      autocomplete="username"
                      style="width:100%;"
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
                  style="font-size:0.75rem; line-height:1rem; color:rgb(239 68 68);"
                >
                  Enter a valid email address.
                </small>
              </div>

              <div
                style="margin-top:1.2rem; display:flex; flex-direction:column; gap:0.5rem;"
              >
                <p-floatLabel>
                  <p-iconField iconPosition="left">
                    <p-password
                      formControlName="password"
                      inputId="login-password"
                      [feedback]="false"
                      toggleMask
                      autocomplete="current-password"
                      style="width:100%;"
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
                  style="font-size:0.75rem; line-height:1rem; color:rgb(239 68 68);"
                >
                  Password must be at least 8 characters long.
                </small>
              </div>
            </p-fluid>

            <button
              pButton
              type="button"
              style="width:100%;"
              [loading]="vm().status === 'authenticating'"
              [disabled]="vm().status === 'authenticating'"
              (click)="onSubmit()"
            >
              <span class="p-button-label">Sign in</span>
            </button>
          </form>

          <p-message
            *ngIf="vm().error"
            severity="error"
            [text]="vm().error!"
            [style]="{ 'margin-top': '1rem' }"
          ></p-message>

          <p-divider align="center" type="dashed" style="margin-top:1.5rem;">
            <span
              style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:rgb(107 114 128);"
            >
              Demo credentials
            </span>
          </p-divider>
          <ul
            style="margin-top:0.75rem; font-size:0.875rem; line-height:1.25rem; color:rgb(75 85 99);"
          >
            <li style="margin-bottom:0.5rem;">
              <span style="font-weight:500; color:rgb(17 24 39);">Owner</span>:
              owner@turbovets.test / ChangeMe123!
            </li>
            <li style="margin-bottom:0.5rem;">
              <span style="font-weight:500; color:rgb(17 24 39);">Admin</span>:
              admin@turbovets.test / ChangeMe123!
            </li>
            <li>
              <span style="font-weight:500; color:rgb(17 24 39);">Viewer</span>:
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
