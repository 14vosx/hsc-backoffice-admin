import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, UrlTree } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('application routes', () => {
  it('registers the canonical administrative auth callback route', () => {
    const callback = routes.find((route) => route.path === 'auth/callback');

    expect(callback?.loadComponent).toBeTypeOf('function');
  });

  it('keeps the legacy callback as an alias and preserves its query params', () => {
    const legacyCallback = routes.find((route) => route.path === 'login/callback');
    const redirect = legacyCallback?.redirectTo;

    expect(redirect).toBeTypeOf('function');
    expect(legacyCallback?.loadComponent).toBeUndefined();
    expect(routes.some((route) => route.path === 'auth/callback')).toBe(true);

    if (typeof redirect !== 'function') {
      throw new Error('Legacy callback redirect is not configured.');
    }

    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const snapshot = new ActivatedRouteSnapshot();
    snapshot.queryParams = { status: 'ok', error: 'forbidden' };
    const result = TestBed.runInInjectionContext(() => redirect(snapshot));

    expect(result).toBeInstanceOf(UrlTree);
    if (result instanceof UrlTree) {
      expect(TestBed.inject(Router).serializeUrl(result)).toBe(
        '/auth/callback?status=ok&error=forbidden',
      );
    }
  });

  it('keeps Player Accounts list and detail inside the protected shell', () => {
    const shell = routes.find((route) => route.path === '');
    expect(shell?.canActivate?.length).toBe(2);
    expect(shell?.children?.some((route) => route.path === 'player-accounts')).toBe(true);
    expect(shell?.children?.some((route) => route.path === 'player-accounts/:id')).toBe(true);
    expect(routes.some((route) => route.path === 'player-accounts')).toBe(false);
  });
});
