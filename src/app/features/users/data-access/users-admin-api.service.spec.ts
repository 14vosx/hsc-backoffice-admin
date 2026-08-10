import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL } from '../../../core/config/api.config';
import { UsersAdminApiService, UsersAdminContractError } from './users-admin-api.service';

const wireUser = {
  id: 7,
  email: 'admin@hsc.gg',
  display_name: 'Admin User',
  role: 'admin',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: null,
};

describe('UsersAdminApiService', () => {
  let service: UsersAdminApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsersAdminApiService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should map a wire list envelope to camelCase domain users', async () => {
    const result = firstValueFrom(service.listUsers());
    http.expectOne(`${API_BASE_URL}/admin/users`).flush({ ok: true, count: 1, items: [wireUser] });

    await expect(result).resolves.toEqual({
      count: 1,
      items: [{
        id: 7,
        email: 'admin@hsc.gg',
        displayName: 'Admin User',
        role: 'admin',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: null,
      }],
    });
  });

  it('should map a create command to snake_case only at the transport boundary', async () => {
    const result = firstValueFrom(service.createUser({
      email: 'admin@hsc.gg',
      displayName: 'Admin User',
      role: 'admin',
    }));
    const request = http.expectOne(`${API_BASE_URL}/admin/users`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({
      email: 'admin@hsc.gg',
      display_name: 'Admin User',
      role: 'admin',
    });
    request.flush({ ok: true, item: wireUser });
    await expect(result).resolves.toMatchObject({ displayName: 'Admin User' });
  });

  it('should map an update command to wire and normalize the response', async () => {
    const result = firstValueFrom(service.updateUser(7, { displayName: 'Renamed', role: 'editor' }));
    const request = http.expectOne(`${API_BASE_URL}/admin/users/7`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ display_name: 'Renamed', role: 'editor' });
    request.flush({ ok: true, item: { ...wireUser, display_name: 'Renamed', role: 'editor' } });
    await expect(result).resolves.toMatchObject({ displayName: 'Renamed', role: 'editor' });
  });

  it('should reject invalid envelopes with UsersAdminContractError', async () => {
    const result = firstValueFrom(service.listUsers());
    http.expectOne(`${API_BASE_URL}/admin/users`).flush({ ok: true, count: 1, items: [{}] });
    await expect(result).rejects.toBeInstanceOf(UsersAdminContractError);
  });
});
