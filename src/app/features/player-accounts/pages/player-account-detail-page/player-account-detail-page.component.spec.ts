import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmationService } from '../../../../shared/state/confirmation.service';
import { UiFeedbackService } from '../../../../shared/state/ui-feedback.service';
import { PlayerAccountsAdminApiService } from '../../data-access/player-accounts-admin-api.service';
import type { AdminPlayerAccount } from '../../domain/admin-player-account.model';
import { PlayerAccountDetailPageComponent } from './player-account-detail-page.component';

const account: AdminPlayerAccount = {
  id: 'account-id', status: 'active', displayName: 'Player One', identities: { email: { linked: true, email: 'player@hsc.gg', verified: true }, steam: { linked: true, steamid64: '76561198000000000' } },
  profile: { exists: true, displayName: 'Profile', slug: 'profile', visibility: 'public', avatarUrl: 'https://avatar' }, membership: { exists: true, status: 'active', planCode: 'premium', startedAt: '2026-01-01T00:00:00Z', expiresAt: null },
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z', disabledAt: null,
};

describe('PlayerAccountDetailPageComponent', () => {
  let fixture: ComponentFixture<PlayerAccountDetailPageComponent>;
  const detail$ = new BehaviorSubject(account);
  const api = { getAccount: vi.fn(() => detail$.asObservable()), updateAccountStatus: vi.fn(() => of({ id: account.id, status: 'disabled', disabledAt: 'now' as string | null, revokedSessions: 2 })) };
  const confirmation = { confirm: vi.fn(() => Promise.resolve(true)) };
  const feedback = { success: vi.fn(), error: vi.fn(), info: vi.fn() };
  beforeEach(async () => {
    vi.clearAllMocks();
    detail$.next(account);
    await TestBed.configureTestingModule({ imports: [PlayerAccountDetailPageComponent], providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: account.id }) } } }, { provide: PlayerAccountsAdminApiService, useValue: api }, { provide: ConfirmationService, useValue: confirmation }, { provide: UiFeedbackService, useValue: feedback }] }).compileComponents();
    fixture = TestBed.createComponent(PlayerAccountDetailPageComponent); fixture.detectChanges();
  });

  it('renders account, identities, profile and membership', () => { const text = fixture.nativeElement.textContent; expect(text).toContain('Player One'); expect(text).toContain('player@hsc.gg'); expect(text).toContain('76561198000000000'); expect(text).toContain('premium'); });

  it('does not mutate when confirmation is cancelled', async () => { confirmation.confirm.mockResolvedValueOnce(false); fixture.nativeElement.querySelector('button').click(); await fixture.whenStable(); expect(api.updateAccountStatus).not.toHaveBeenCalled(); });

  it('disables, reports revoked sessions and reloads detail', async () => { fixture.nativeElement.querySelector('button').click(); await fixture.whenStable(); expect(api.updateAccountStatus).toHaveBeenCalledWith(account.id, { status: 'disabled' }); expect(feedback.success).toHaveBeenCalledWith(expect.stringContaining('2 sessão(ões)')); expect(api.getAccount).toHaveBeenCalledTimes(2); });

  it('reactivates a disabled account', async () => {
    detail$.next({ ...account, status: 'disabled', disabledAt: '2026-03-01T00:00:00Z' }); fixture.detectChanges();
    api.updateAccountStatus.mockReturnValueOnce(of({ id: account.id, status: 'active', disabledAt: null, revokedSessions: 0 }));
    fixture.nativeElement.querySelector('button').click(); await fixture.whenStable();
    expect(api.updateAccountStatus).toHaveBeenCalledWith(account.id, { status: 'active' }); expect(feedback.success).toHaveBeenCalledWith('Conta reativada.');
  });

  it('prevents duplicate mutation while pending', async () => {
    const mutation$ = new Subject<{ id: string; status: 'disabled'; disabledAt: string; revokedSessions: number }>(); api.updateAccountStatus.mockReturnValueOnce(mutation$);
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement; button.click(); await fixture.whenStable(); button.click(); await fixture.whenStable(); expect(api.updateAccountStatus).toHaveBeenCalledTimes(1);
  });
});
