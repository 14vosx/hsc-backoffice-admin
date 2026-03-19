import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthSessionStore } from '../auth/auth-session.store';

export const adminAccessGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const router = inject(Router);
  const authSessionStore = inject(AuthSessionStore);

  await authSessionStore.ensureSessionResolved();

  if (authSessionStore.isUnauthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (!authSessionStore.isAdminAreaAllowed()) {
    return router.createUrlTree(['/403']);
  }

  return true;
};