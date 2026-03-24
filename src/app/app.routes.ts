import { Routes } from '@angular/router';
import { adminAccessGuard } from './core/guards/admin-access.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
    title: 'Login | HSC Backoffice',
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./features/auth/pages/auth-callback-page/auth-callback-page.component').then(
        (m) => m.AuthCallbackPageComponent,
      ),
    title: 'Autenticação | HSC Backoffice',
  },
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/admin-shell/admin-shell.component').then(
        (m) => m.AdminShellComponent,
      ),
    canActivate: [authGuard, adminAccessGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(
            (m) => m.DashboardPageComponent,
          ),
        title: 'Dashboard | HSC Backoffice',
      },
      {
        path: 'seasons',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'news',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/pages/users-page/users-page.component').then(
            (m) => m.UsersPageComponent,
          ),
        title: 'Usuários | HSC Backoffice',
      },
      {
        path: 'events',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '403',
    loadComponent: () =>
      import('./features/error-pages/forbidden-page/forbidden-page.component').then(
        (m) => m.ForbiddenPageComponent,
      ),
    title: '403 | HSC Backoffice',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/error-pages/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent,
      ),
    title: '404 | HSC Backoffice',
  },
];