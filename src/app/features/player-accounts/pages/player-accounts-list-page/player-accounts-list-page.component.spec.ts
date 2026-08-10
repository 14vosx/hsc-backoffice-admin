import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlayerAccountsAdminApiService } from '../../data-access/player-accounts-admin-api.service';
import type { AdminPlayerAccount } from '../../domain/admin-player-account.model';
import { PlayerAccountsListPageComponent } from './player-accounts-list-page.component';

const account: AdminPlayerAccount = {
  id: 'account-id', status: 'active', displayName: 'Player One',
  identities: { email: { linked: true, email: 'player@hsc.gg', verified: true }, steam: { linked: true, steamid64: '76561198000000000' } },
  profile: { exists: true, displayName: 'Profile', slug: 'profile', visibility: 'public', avatarUrl: null },
  membership: { exists: true, status: 'active', planCode: 'premium', startedAt: '2026-01-01T00:00:00Z', expiresAt: null },
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z', disabledAt: null,
};

describe('PlayerAccountsListPageComponent', () => {
  let fixture: ComponentFixture<PlayerAccountsListPageComponent>;
  const response$ = new BehaviorSubject({ count: 1, items: [account] });
  const api = { listAccounts: vi.fn(() => response$.asObservable()) };
  beforeEach(async () => {
    api.listAccounts.mockClear();
    await TestBed.configureTestingModule({ imports: [PlayerAccountsListPageComponent], providers: [provideRouter([]), { provide: PlayerAccountsAdminApiService, useValue: api }] }).compileComponents();
    fixture = TestBed.createComponent(PlayerAccountsListPageComponent);
  });

  it('shows loading and then ready data', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Player One');
    expect(fixture.nativeElement.textContent).toContain('player@hsc.gg');
  });

  it('shows the empty state', () => { response$.next({ count: 0, items: [] }); fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('Nenhuma conta de jogador encontrada.'); });

  it('sends search and status filters with fixed limit 50', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement; input.value = 'steam';
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement; form.dispatchEvent(new Event('submit'));
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement; select.value = 'disabled'; select.dispatchEvent(new Event('change'));
    expect(api.listAccounts).toHaveBeenLastCalledWith({ q: 'steam', status: 'disabled', limit: 50 });
  });

  it('contains navigation to detail', () => { response$.next({ count: 1, items: [account] }); fixture.detectChanges(); expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/player-accounts/account-id'); });
});
