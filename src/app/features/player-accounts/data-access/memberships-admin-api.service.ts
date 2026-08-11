import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import type { AdminMembership, AdminMembershipLifecycleAction, AdminMembershipSource, AdminMembershipStatus, GrantAdminMembershipCommand } from '../domain/admin-membership.model';

interface GrantMembershipWireCommand {
  readonly player_account_id: string;
  readonly plan_code: string;
  readonly expires_at: string | null;
}

export class MembershipsAdminContractError extends Error {
  constructor(part: string) {
    super(`Invalid admin membership ${part}`);
    this.name = 'MembershipsAdminContractError';
  }
}

@Injectable({ providedIn: 'root' })
export class MembershipsAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/admin/memberships`;

  getByPlayer(playerAccountId: string): Observable<AdminMembership> {
    return this.http.get<unknown>(`${this.endpoint}/by-player/${encodeURIComponent(playerAccountId)}`, { withCredentials: true })
      .pipe(map(normalizeEnvelope));
  }

  grant(command: GrantAdminMembershipCommand): Observable<AdminMembership> {
    const body: GrantMembershipWireCommand = {
      player_account_id: command.playerAccountId,
      plan_code: command.planCode,
      expires_at: command.expiresAt,
    };
    return this.http.post<unknown>(this.endpoint, body, { withCredentials: true }).pipe(map(normalizeEnvelope));
  }

  activate(id: string): Observable<AdminMembership> { return this.lifecycle(id, 'activate'); }
  suspend(id: string): Observable<AdminMembership> { return this.lifecycle(id, 'suspend'); }
  reactivate(id: string): Observable<AdminMembership> { return this.lifecycle(id, 'reactivate'); }
  cancel(id: string): Observable<AdminMembership> { return this.lifecycle(id, 'cancel'); }

  private lifecycle(id: string, action: AdminMembershipLifecycleAction): Observable<AdminMembership> {
    return this.http.post<unknown>(`${this.endpoint}/${encodeURIComponent(id)}/${action}`, {}, { withCredentials: true })
      .pipe(map(normalizeEnvelope));
  }
}

function normalizeEnvelope(payload: unknown): AdminMembership {
  if (!isRecord(payload) || payload['ok'] !== true) throw new MembershipsAdminContractError('envelope');
  return normalizeMembership(payload['item']);
}

function normalizeMembership(value: unknown): AdminMembership {
  if (!isRecord(value)) throw new MembershipsAdminContractError('item');
  const id = requiredString(value['id']);
  const playerAccountId = requiredString(value['player_account_id']);
  const status = membershipStatus(value['status']);
  const planCode = requiredString(value['plan_code']);
  const source = membershipSource(value['source']);
  const startedAt = nullableString(value['started_at']);
  const expiresAt = nullableString(value['expires_at']);
  const suspendedAt = nullableString(value['suspended_at']);
  const cancelledAt = nullableString(value['cancelled_at']);
  const createdAt = requiredString(value['created_at']);
  const updatedAt = requiredString(value['updated_at']);
  if (!id || !playerAccountId || !status || !planCode || !source || startedAt === undefined || expiresAt === undefined || suspendedAt === undefined || cancelledAt === undefined || !createdAt || !updatedAt) {
    throw new MembershipsAdminContractError('fields');
  }
  return { id, playerAccountId, status, planCode, source, startedAt, expiresAt, suspendedAt, cancelledAt, createdAt, updatedAt };
}

function membershipStatus(value: unknown): AdminMembershipStatus | null {
  return value === 'inactive' || value === 'active' || value === 'suspended' || value === 'expired' || value === 'cancelled' ? value : null;
}
function membershipSource(value: unknown): AdminMembershipSource | null {
  return value === 'manual' || value === 'staff' || value === 'promotion' || value === 'subscription' ? value : null;
}
function requiredString(value: unknown): string | null { return typeof value === 'string' && value.trim() ? value : null; }
function nullableString(value: unknown): string | null | undefined { return value === null ? null : typeof value === 'string' ? value : undefined; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
