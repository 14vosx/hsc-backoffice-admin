import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL } from '../../../core/config/api.config';
import {
  AdminEmailAuthApiService,
  AdminEmailAuthContractError,
} from './admin-email-auth-api.service';

describe('AdminEmailAuthApiService', () => {
  let service: AdminEmailAuthApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminEmailAuthApiService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should preserve the endpoint, credentials and typed result', async () => {
    const result = firstValueFrom(service.requestMagicLink({ email: 'admin@hsc.gg' }));
    const request = http.expectOne(`${API_BASE_URL}/auth/magic-link/request`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({ email: 'admin@hsc.gg' });
    request.flush({ ok: true, message: ' Link enviado. ' });

    await expect(result).resolves.toEqual({ message: 'Link enviado.' });
  });

  it('should reject an invalid response envelope', async () => {
    const result = firstValueFrom(service.requestMagicLink({ email: 'admin@hsc.gg' }));
    http.expectOne(`${API_BASE_URL}/auth/magic-link/request`).flush({ ok: false });
    await expect(result).rejects.toBeInstanceOf(AdminEmailAuthContractError);
  });
});
