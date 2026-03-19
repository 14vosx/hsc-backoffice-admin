import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthSessionStore } from '../auth/auth-session.store';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const authSessionStore = inject(AuthSessionStore);

  const status = authSessionStore.status();

  if (status === 'authenticated') {
    return true;
  }

  return router.createUrlTree(['/login']);
};