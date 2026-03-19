import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthSessionStore } from '../auth/auth-session.store';

export const authGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const router = inject(Router);
  const authSessionStore = inject(AuthSessionStore);
  
  await authSessionStore.ensureSessionResolved();
  
  if (authSessionStore.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};