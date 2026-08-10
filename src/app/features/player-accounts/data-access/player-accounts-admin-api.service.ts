import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import type {
  AdminPlayerAccount,
  PlayerAccountStatus,
  PlayerMembershipStatus,
  PlayerProfileVisibility,
  UpdatePlayerAccountStatusCommand,
} from '../domain/admin-player-account.model';

export interface PlayerAccountListFilters {
  readonly q?: string;
  readonly status?: PlayerAccountStatus;
  readonly limit?: number;
}

export interface AdminPlayerAccountsList {
  readonly count: number;
  readonly items: AdminPlayerAccount[];
}

export interface UpdatePlayerAccountStatusResult {
  readonly id: string;
  readonly status: PlayerAccountStatus;
  readonly disabledAt: string | null;
  readonly revokedSessions: number;
}

export class PlayerAccountsAdminContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlayerAccountsAdminContractError';
  }
}

@Injectable({ providedIn: 'root' })
export class PlayerAccountsAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/admin/player-accounts`;

  listAccounts(filters: PlayerAccountListFilters = {}): Observable<AdminPlayerAccountsList> {
    let params = new HttpParams();
    const query = filters.q?.trim();
    if (query) params = params.set('q', query);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.limit !== undefined) params = params.set('limit', filters.limit);
    return this.http.get<unknown>(this.endpoint, { params, withCredentials: true }).pipe(map(normalizeList));
  }

  getAccount(id: string): Observable<AdminPlayerAccount> {
    return this.http.get<unknown>(`${this.endpoint}/${encodeURIComponent(id)}`, { withCredentials: true })
      .pipe(map((payload) => normalizeDetail(payload)));
  }

  updateAccountStatus(id: string, command: UpdatePlayerAccountStatusCommand): Observable<UpdatePlayerAccountStatusResult> {
    return this.http.patch<unknown>(`${this.endpoint}/${encodeURIComponent(id)}`, { status: command.status }, { withCredentials: true })
      .pipe(map(normalizeMutation));
  }
}

function normalizeList(payload: unknown): AdminPlayerAccountsList {
  if (!isRecord(payload) || payload['ok'] !== true || !Number.isInteger(payload['count']) || !Array.isArray(payload['items'])) {
    throw contractError('list envelope');
  }
  const items = payload['items'].map(normalizeAccount);
  return { count: payload['count'] as number, items };
}

function normalizeDetail(payload: unknown): AdminPlayerAccount {
  if (!isRecord(payload) || payload['ok'] !== true) throw contractError('detail envelope');
  return normalizeAccount(payload['item']);
}

function normalizeMutation(payload: unknown): UpdatePlayerAccountStatusResult {
  if (!isRecord(payload) || payload['ok'] !== true || !isRecord(payload['item'])) throw contractError('mutation envelope');
  const item = payload['item'];
  const id = requiredString(item['id']);
  const status = accountStatus(item['status']);
  const disabledAt = nullableString(item['disabled_at']);
  const revokedSessions = item['revoked_sessions'];
  if (!id || !status || disabledAt === undefined || !Number.isInteger(revokedSessions) || (revokedSessions as number) < 0) {
    throw contractError('mutation item');
  }
  return { id, status, disabledAt, revokedSessions: revokedSessions as number };
}

function normalizeAccount(value: unknown): AdminPlayerAccount {
  if (!isRecord(value)) throw contractError('account');
  const identities = value['identities'];
  const profile = value['profile'];
  const membership = value['membership'];
  if (!isRecord(identities) || !isRecord(identities['email']) || !isRecord(identities['steam'])) throw contractError('identities');
  if (!isRecord(profile)) throw contractError('profile');
  if (!isRecord(membership)) throw contractError('membership');
  const email = identities['email'];
  const steam = identities['steam'];
  const id = requiredString(value['id']);
  const status = accountStatus(value['status']);
  const displayName = nullableString(value['display_name']);
  const createdAt = requiredString(value['created_at']);
  const updatedAt = requiredString(value['updated_at']);
  const disabledAt = nullableString(value['disabled_at']);
  const profileVisibility = nullableVisibility(profile['visibility']);
  const membershipStatus = nullableMembershipStatus(membership['status']);
  const strings = [nullableString(email['email']), nullableString(steam['steamid64']), nullableString(profile['display_name']), nullableString(profile['slug']), nullableString(profile['avatar_url']), nullableString(membership['plan_code']), nullableString(membership['started_at']), nullableString(membership['expires_at'])];
  if (!id || !status || displayName === undefined || !createdAt || !updatedAt || disabledAt === undefined || profileVisibility === undefined || membershipStatus === undefined || strings.some((item) => item === undefined) || typeof email['linked'] !== 'boolean' || typeof email['verified'] !== 'boolean' || typeof steam['linked'] !== 'boolean' || typeof profile['exists'] !== 'boolean' || typeof membership['exists'] !== 'boolean') {
    throw contractError('account fields');
  }
  return {
    id, status, displayName,
    identities: { email: { linked: email['linked'], email: strings[0] ?? null, verified: email['verified'] }, steam: { linked: steam['linked'], steamid64: strings[1] ?? null } },
    profile: { exists: profile['exists'], displayName: strings[2] ?? null, slug: strings[3] ?? null, visibility: profileVisibility, avatarUrl: strings[4] ?? null },
    membership: { exists: membership['exists'], status: membershipStatus, planCode: strings[5] ?? null, startedAt: strings[6] ?? null, expiresAt: strings[7] ?? null },
    createdAt, updatedAt, disabledAt,
  };
}

function accountStatus(value: unknown): PlayerAccountStatus | null { return value === 'active' || value === 'disabled' ? value : null; }
function nullableVisibility(value: unknown): PlayerProfileVisibility | null | undefined { return value === null ? null : value === 'private' || value === 'public' ? value : undefined; }
function nullableMembershipStatus(value: unknown): PlayerMembershipStatus | null | undefined { return value === null ? null : value === 'inactive' || value === 'active' || value === 'suspended' || value === 'expired' || value === 'cancelled' ? value : undefined; }
function requiredString(value: unknown): string | null { return typeof value === 'string' && value.trim() ? value : null; }
function nullableString(value: unknown): string | null | undefined { return value === null ? null : typeof value === 'string' ? value : undefined; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function contractError(part: string): PlayerAccountsAdminContractError { return new PlayerAccountsAdminContractError(`Invalid player accounts ${part}`); }
