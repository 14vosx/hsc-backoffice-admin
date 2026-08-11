import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL } from '../../../core/config/api.config';
import { isMembershipNotFound } from '../utils/memberships-error.mapper';
import { MembershipsAdminApiService } from './memberships-admin-api.service';

const playerAccountId = '11111111-1111-4111-8111-111111111111';
const membershipId = '22222222-2222-4222-8222-222222222222';
const wireMembership = {
  id: membershipId, player_account_id: playerAccountId, status: 'active', plan_code: 'member', source: 'staff',
  started_at: '2026-08-07T18:00:00Z', expires_at: '2027-08-07T18:00:00Z', suspended_at: null, cancelled_at: null,
  created_at: '2026-08-07T18:00:00Z', updated_at: '2026-08-07T18:00:00Z',
};

describe('MembershipsAdminApiService', () => {
  let service: MembershipsAdminApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(MembershipsAdminApiService);
    http = TestBed.inject(HttpTestingController);
  });

  it('GETs by player with credentials and normalizes the complete item', async () => {
    const response = firstValueFrom(service.getByPlayer(playerAccountId));
    const request = http.expectOne(`${API_BASE_URL}/admin/memberships/by-player/${playerAccountId}`);
    expect(request.request.method).toBe('GET'); expect(request.request.withCredentials).toBe(true);
    request.flush({ ok: true, item: wireMembership });
    await expect(response).resolves.toEqual({
      id: membershipId, playerAccountId, status: 'active', planCode: 'member', source: 'staff',
      startedAt: wireMembership.started_at, expiresAt: wireMembership.expires_at, suspendedAt: null, cancelledAt: null,
      createdAt: wireMembership.created_at, updatedAt: wireMembership.updated_at,
    });
  });

  it('keeps membership_not_found distinguishable', async () => {
    const response = firstValueFrom(service.getByPlayer(playerAccountId));
    http.expectOne(`${API_BASE_URL}/admin/memberships/by-player/${playerAccountId}`).flush({ ok: false, error: 'membership_not_found' }, { status: 404, statusText: 'Not Found' });
    const error = await response.catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(HttpErrorResponse); expect(isMembershipNotFound(error)).toBe(true);
  });

  it('POSTs grant using snake_case, UTC Z and credentials', async () => {
    const response = firstValueFrom(service.grant({ playerAccountId, planCode: 'member', expiresAt: '2027-08-07T18:00:00.000Z' }));
    const request = http.expectOne(`${API_BASE_URL}/admin/memberships`);
    expect(request.request.method).toBe('POST'); expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({ player_account_id: playerAccountId, plan_code: 'member', expires_at: '2027-08-07T18:00:00.000Z' });
    request.flush({ ok: true, item: wireMembership }); await expect(response).resolves.toMatchObject({ id: membershipId });
  });

  it.each(['activate', 'suspend', 'reactivate', 'cancel'] as const)('POSTs %s with credentials', async (action) => {
    const response = firstValueFrom(service[action](membershipId));
    const request = http.expectOne(`${API_BASE_URL}/admin/memberships/${membershipId}/${action}`);
    expect(request.request.method).toBe('POST'); expect(request.request.body).toEqual({}); expect(request.request.withCredentials).toBe(true);
    request.flush({ ok: true, item: wireMembership }); await expect(response).resolves.toMatchObject({ id: membershipId });
  });
});
