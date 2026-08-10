import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL } from '../../../core/config/api.config';
import { PlayerAccountsAdminApiService, PlayerAccountsAdminContractError } from './player-accounts-admin-api.service';

const wireAccount = {
  id: '31f6222a-88a0-4b6c-a21c-dd8d5016863d', status: 'active', display_name: 'Player One',
  identities: { email: { linked: true, email: 'player@hsc.gg', verified: true }, steam: { linked: true, steamid64: '76561198000000000' } },
  profile: { exists: true, display_name: 'Profile One', slug: 'profile-one', visibility: 'public', avatar_url: 'https://cdn.hsc.gg/avatar.png' },
  membership: { exists: true, status: 'active', plan_code: 'premium', started_at: '2026-01-01T00:00:00Z', expires_at: null },
  created_at: '2026-01-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z', disabled_at: null,
};

describe('PlayerAccountsAdminApiService', () => {
  let service: PlayerAccountsAdminApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PlayerAccountsAdminApiService);
    http = TestBed.inject(HttpTestingController);
  });

  it('maps list wire data to the camelCase domain and sends filters', async () => {
    const response = firstValueFrom(service.listAccounts({ q: 'Player', status: 'active', limit: 50 }));
    const request = http.expectOne((candidate) => candidate.url === `${API_BASE_URL}/admin/player-accounts`);
    expect(request.request.params.get('q')).toBe('Player'); expect(request.request.params.get('status')).toBe('active'); expect(request.request.params.get('limit')).toBe('50'); expect(request.request.withCredentials).toBe(true);
    request.flush({ ok: true, count: 1, items: [wireAccount] });
    await expect(response).resolves.toMatchObject({ count: 1, items: [{ displayName: 'Player One', profile: { avatarUrl: 'https://cdn.hsc.gg/avatar.png' }, membership: { planCode: 'premium' } }] });
  });

  it('maps a detail envelope', async () => {
    const response = firstValueFrom(service.getAccount(wireAccount.id));
    http.expectOne(`${API_BASE_URL}/admin/player-accounts/${wireAccount.id}`).flush({ ok: true, item: wireAccount });
    await expect(response).resolves.toMatchObject({ id: wireAccount.id, identities: { email: { verified: true } } });
  });

  it('PATCH sends only status and maps the mutation-specific response', async () => {
    const response = firstValueFrom(service.updateAccountStatus(wireAccount.id, { status: 'disabled' }));
    const request = http.expectOne(`${API_BASE_URL}/admin/player-accounts/${wireAccount.id}`);
    expect(request.request.method).toBe('PATCH'); expect(request.request.body).toEqual({ status: 'disabled' }); expect(request.request.withCredentials).toBe(true);
    request.flush({ ok: true, item: { id: wireAccount.id, status: 'disabled', disabled_at: '2026-03-01T00:00:00Z', revoked_sessions: 3 } });
    await expect(response).resolves.toEqual({ id: wireAccount.id, status: 'disabled', disabledAt: '2026-03-01T00:00:00Z', revokedSessions: 3 });
  });

  it.each([
    ['envelope', { count: 1, items: [wireAccount] }],
    ['identity', { ok: true, count: 1, items: [{ ...wireAccount, identities: null }] }],
    ['profile', { ok: true, count: 1, items: [{ ...wireAccount, profile: { ...wireAccount.profile, visibility: 'friends' } }] }],
    ['membership', { ok: true, count: 1, items: [{ ...wireAccount, membership: { ...wireAccount.membership, status: 'unknown' } }] }],
    ['status', { ok: true, count: 1, items: [{ ...wireAccount, status: 'pending' }] }],
  ])('rejects invalid %s data', async (_name, payload) => {
    const response = firstValueFrom(service.listAccounts());
    http.expectOne(`${API_BASE_URL}/admin/player-accounts`).flush(payload);
    await expect(response).rejects.toBeInstanceOf(PlayerAccountsAdminContractError);
  });
});
