import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';

export interface AdminMagicLinkRequestCommand {
  readonly email: string;
}

export interface AdminMagicLinkRequestResult {
  readonly message: string | null;
}

export class AdminEmailAuthContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminEmailAuthContractError';
  }
}

@Injectable({
  providedIn: 'root',
})
export class AdminEmailAuthApiService {
  private readonly http = inject(HttpClient);
  private readonly requestMagicLinkEndpoint = `${API_BASE_URL}/auth/magic-link/request`;

  requestMagicLink(command: AdminMagicLinkRequestCommand): Observable<AdminMagicLinkRequestResult> {
    return this.http
      .post<unknown>(this.requestMagicLinkEndpoint, command, { withCredentials: true })
      .pipe(
        map((payload) => {
          const result = normalizeMagicLinkRequestResult(payload);
          if (!result) {
            throw new AdminEmailAuthContractError('Invalid admin magic-link response envelope');
          }
          return result;
        }),
      );
  }
}

function normalizeMagicLinkRequestResult(payload: unknown): AdminMagicLinkRequestResult | null {
  if (!isRecord(payload) || payload['ok'] !== true) {
    return null;
  }

  const message = payload['message'];
  if (message !== undefined && typeof message !== 'string') {
    return null;
  }

  return {
    message: typeof message === 'string' ? message.trim() || null : null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
