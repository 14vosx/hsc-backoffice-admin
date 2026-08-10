import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('application routes', () => {
  it('keeps Player Accounts list and detail inside the protected shell', () => {
    const shell = routes.find((route) => route.path === '');
    expect(shell?.canActivate?.length).toBe(2);
    expect(shell?.children?.some((route) => route.path === 'player-accounts')).toBe(true);
    expect(shell?.children?.some((route) => route.path === 'player-accounts/:id')).toBe(true);
    expect(routes.some((route) => route.path === 'player-accounts')).toBe(false);
  });
});
