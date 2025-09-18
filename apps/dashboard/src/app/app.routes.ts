import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
