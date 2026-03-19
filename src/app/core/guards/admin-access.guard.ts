import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthSessionStore } from '../auth/auth-session.store';

export const adminAccessGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const authSessionStore = inject(AuthSessionStore);

  const status = authSessionStore.status();

  if (status === 'unauthenticated') {
    return router.createUrlTree(['/login']);
  }

  if (!authSessionStore.isAdminAreaAllowed()) {
    return router.createUrlTree(['/403']);
  }

  return true;
};