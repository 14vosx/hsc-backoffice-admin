import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmationService } from '../../../../shared/state/confirmation.service';
import { UiFeedbackService } from '../../../../shared/state/ui-feedback.service';
import { MembershipsAdminApiService } from '../../data-access/memberships-admin-api.service';
import { PlayerAccountsAdminApiService } from '../../data-access/player-accounts-admin-api.service';
import type { AdminMembership, AdminMembershipStatus } from '../../domain/admin-membership.model';
import type { AdminPlayerAccount } from '../../domain/admin-player-account.model';
import { PlayerAccountDetailPageComponent } from './player-account-detail-page.component';

const account: AdminPlayerAccount = {
  id: 'account-id', status: 'active', displayName: 'Player One', identities: { email: { linked: true, email: 'player@hsc.gg', verified: true }, steam: { linked: true, steamid64: '76561198000000000' } },
  profile: { exists: true, displayName: 'Profile', slug: 'profile', visibility: 'public', avatarUrl: 'https://avatar' }, membership: { exists: true, status: 'active', planCode: 'premium', startedAt: '2026-01-01T00:00:00Z', expiresAt: null },
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z', disabledAt: null,
};
const membership: AdminMembership = {
  id: 'membership-id', playerAccountId: account.id, status: 'active', planCode: 'premium', source: 'staff', startedAt: '2026-01-01T00:00:00Z', expiresAt: null,
  suspendedAt: null, cancelledAt: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
};

function httpError(code: string, status = 409): HttpErrorResponse { return new HttpErrorResponse({ status, error: { ok: false, error: code } }); }

describe('PlayerAccountDetailPageComponent', () => {
  let fixture: ComponentFixture<PlayerAccountDetailPageComponent>;
  let membership$: BehaviorSubject<AdminMembership>;
  const accountsApi = { getAccount: vi.fn(() => of(account)), updateAccountStatus: vi.fn(() => of({ id: account.id, status: 'disabled', disabledAt: 'now' as string | null, revokedSessions: 2 })) };
  const membershipsApi = {
    getByPlayer: vi.fn(), grant: vi.fn(() => of(membership)), activate: vi.fn(() => of(membership)), suspend: vi.fn(() => of(membership)),
    reactivate: vi.fn(() => of(membership)), cancel: vi.fn(() => of(membership)),
  };
  const confirmation = { confirm: vi.fn(() => Promise.resolve(true)) };
  const feedback = { success: vi.fn(), error: vi.fn(), info: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    accountsApi.getAccount.mockReturnValue(of(account));
    membership$ = new BehaviorSubject(membership);
    membershipsApi.getByPlayer.mockReturnValue(membership$.asObservable());
    await TestBed.configureTestingModule({
      imports: [PlayerAccountDetailPageComponent],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: account.id }) } } },
        { provide: PlayerAccountsAdminApiService, useValue: accountsApi }, { provide: MembershipsAdminApiService, useValue: membershipsApi },
        { provide: ConfirmationService, useValue: confirmation }, { provide: UiFeedbackService, useValue: feedback }],
    }).compileComponents();
    fixture = TestBed.createComponent(PlayerAccountDetailPageComponent); fixture.detectChanges();
  });

  function text(): string { return fixture.nativeElement.textContent; }
  function button(label: string): HTMLButtonElement { return [...fixture.nativeElement.querySelectorAll('button')].find((item) => (item.textContent ?? '').trim().includes(label)) as HTMLButtonElement; }
  function showStatus(status: AdminMembershipStatus): void { membership$.next({ ...membership, status }); fixture.detectChanges(); }

  describe('Player Account management', () => {
    it('renders account, identities and profile', () => {
      expect(text()).toContain('Player One');
      expect(text()).toContain('player@hsc.gg');
      expect(text()).toContain('76561198000000000');
      expect(text()).toContain('Profile');
    });

    it('does not update the account when confirmation is cancelled', async () => {
      confirmation.confirm.mockResolvedValueOnce(false);
      button('Desativar conta').click(); await fixture.whenStable();
      expect(accountsApi.updateAccountStatus).not.toHaveBeenCalled();
    });

    it('disables the account, reports revoked sessions and reloads its detail', async () => {
      button('Desativar conta').click(); await fixture.whenStable();
      expect(accountsApi.updateAccountStatus).toHaveBeenCalledWith(account.id, { status: 'disabled' });
      expect(feedback.success).toHaveBeenCalledWith(expect.stringContaining('2 sessão(ões)'));
      expect(accountsApi.getAccount).toHaveBeenCalledTimes(2);
    });

    it('reactivates a disabled account', async () => {
      const disabledAccount: AdminPlayerAccount = { ...account, status: 'disabled', disabledAt: '2026-03-01T00:00:00Z' };
      accountsApi.getAccount.mockReturnValue(of(disabledAccount));
      accountsApi.updateAccountStatus.mockReturnValueOnce(of({ id: account.id, status: 'active', disabledAt: null, revokedSessions: 0 }));
      fixture = TestBed.createComponent(PlayerAccountDetailPageComponent); fixture.detectChanges();
      button('Reativar conta').click(); await fixture.whenStable();
      expect(accountsApi.updateAccountStatus).toHaveBeenCalledWith(account.id, { status: 'active' });
      expect(feedback.success).toHaveBeenCalledWith('Conta reativada.');
    });

    it('prevents duplicate account updates while the mutation is pending', async () => {
      const mutation$ = new Subject<{ id: string; status: 'disabled'; disabledAt: string; revokedSessions: number }>();
      accountsApi.updateAccountStatus.mockReturnValueOnce(mutation$);
      const action = button('Desativar conta'); action.click(); await fixture.whenStable(); action.click(); await fixture.whenStable();
      expect(accountsApi.updateAccountStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('Membership management', () => {

  it('shows the grant form when membership_not_found and keeps account data visible', () => {
    membershipsApi.getByPlayer.mockReturnValue(throwError(() => httpError('membership_not_found', 404)));
    fixture = TestBed.createComponent(PlayerAccountDetailPageComponent); fixture.detectChanges();
    expect(text()).toContain('Sem associação'); expect(text()).toContain('Conceder associação'); expect(text()).toContain('Player One'); expect(text()).toContain('player@hsc.gg');
  });

  it('grants with the correct contract and converts local expiry to UTC ISO', async () => {
    membershipsApi.getByPlayer.mockReturnValue(throwError(() => httpError('membership_not_found', 404)));
    fixture = TestBed.createComponent(PlayerAccountDetailPageComponent); fixture.detectChanges();
    accountsApi.getAccount.mockClear();
    membershipsApi.getByPlayer.mockClear();
    const plan = fixture.nativeElement.querySelector('#membership-plan') as HTMLInputElement;
    const expiry = fixture.nativeElement.querySelector('#membership-expiry') as HTMLInputElement;
    plan.value = '  premium  '; plan.dispatchEvent(new Event('input')); expiry.value = '2027-01-15T12:30'; expiry.dispatchEvent(new Event('input'));
    button('Conceder associação').click(); await fixture.whenStable();
    expect(membershipsApi.grant).toHaveBeenCalledWith({ playerAccountId: account.id, planCode: 'premium', expiresAt: new Date('2027-01-15T12:30').toISOString() });
    expect(accountsApi.getAccount).toHaveBeenCalledTimes(1); expect(membershipsApi.getByPlayer).toHaveBeenCalledTimes(1);
  });

  it('grants without expiry using null', async () => {
    membershipsApi.getByPlayer.mockReturnValue(throwError(() => httpError('membership_not_found', 404)));
    fixture = TestBed.createComponent(PlayerAccountDetailPageComponent); fixture.detectChanges();
    const plan = fixture.nativeElement.querySelector('#membership-plan') as HTMLInputElement; plan.value = 'staff'; plan.dispatchEvent(new Event('input'));
    button('Conceder associação').click(); await fixture.whenStable();
    expect(membershipsApi.grant).toHaveBeenCalledWith({ playerAccountId: account.id, planCode: 'staff', expiresAt: null });
  });

  it('prevents duplicate grant while the request is pending', async () => {
    membershipsApi.getByPlayer.mockReturnValue(throwError(() => httpError('membership_not_found', 404)));
    const mutation$ = new Subject<AdminMembership>(); membershipsApi.grant.mockReturnValueOnce(mutation$);
    fixture = TestBed.createComponent(PlayerAccountDetailPageComponent); fixture.detectChanges();
    const plan = fixture.nativeElement.querySelector('#membership-plan') as HTMLInputElement; plan.value = 'staff'; plan.dispatchEvent(new Event('input'));
    const action = button('Conceder associação'); action.click(); await fixture.whenStable(); fixture.detectChanges();
    expect(action.disabled).toBe(true);
    action.click(); await fixture.whenStable();
    expect(membershipsApi.grant).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['inactive', ['Ativar associação'], ['Suspender associação', 'Reativar associação', 'Cancelar associação']],
    ['active', ['Suspender associação', 'Cancelar associação'], ['Ativar associação', 'Reativar associação']],
    ['suspended', ['Reativar associação', 'Cancelar associação'], ['Ativar associação', 'Suspender associação']],
  ] as const)('%s exposes exactly its valid actions', (status, visible, hidden) => {
    showStatus(status);
    for (const label of visible) expect(button(label)).toBeTruthy();
    for (const label of hidden) expect(button(label)).toBeFalsy();
  });

  it.each(['expired', 'cancelled'] as const)('%s is terminal and exposes no lifecycle actions', (status) => {
    showStatus(status); expect(text()).toContain('Estado terminal'); expect(button('Ativar associação')).toBeFalsy(); expect(button('Suspender associação')).toBeFalsy(); expect(button('Reativar associação')).toBeFalsy(); expect(button('Cancelar associação')).toBeFalsy();
  });

  it('prevents duplicate lifecycle mutations while pending', async () => {
    const mutation$ = new Subject<AdminMembership>(); membershipsApi.suspend.mockReturnValueOnce(mutation$);
    const action = button('Suspender associação'); action.click(); await fixture.whenStable(); action.click(); await fixture.whenStable();
    expect(membershipsApi.suspend).toHaveBeenCalledTimes(1);
  });

  it('keeps account sections visible when membership read fails', () => {
    membershipsApi.getByPlayer.mockReturnValue(throwError(() => httpError('db_not_ready', 503)));
    fixture = TestBed.createComponent(PlayerAccountDetailPageComponent); fixture.detectChanges();
    expect(text()).toContain('Serviço de dados temporariamente indisponível.'); expect(text()).toContain('Player One'); expect(text()).toContain('76561198000000000'); expect(text()).toContain('Profile');
  });

  it('reports lifecycle conflicts and revalidates account and membership', async () => {
    membershipsApi.suspend.mockReturnValueOnce(throwError(() => httpError('membership_not_active')));
    button('Suspender associação').click(); await fixture.whenStable();
    expect(feedback.info).toHaveBeenCalledWith(expect.stringContaining('não está ativa')); expect(accountsApi.getAccount).toHaveBeenCalledTimes(2); expect(membershipsApi.getByPlayer).toHaveBeenCalledTimes(2);
  });
  });
});
