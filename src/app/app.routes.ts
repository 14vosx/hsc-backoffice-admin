import { Routes } from '@angular/router';

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
    path: '',
    loadComponent: () =>
      import('./core/layout/admin-shell/admin-shell.component').then(
        (m) => m.AdminShellComponent,
      ),
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