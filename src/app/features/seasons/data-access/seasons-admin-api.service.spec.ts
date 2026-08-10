import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL } from '../../../core/config/api.config';
import { SeasonsAdminApiService } from './seasons-admin-api.service';
import { SeasonsAdminContractError } from './seasons-admin.contract';

const wireItem = { id: 1, slug: 'one', name: 'One', description: null, cover_image_url: null, start_at: '2026-01-01T00:00:00Z', end_at: '2026-02-01T00:00:00Z', status: 'draft', created_at: '2025-12-01T00:00:00Z', updated_at: '2025-12-01T00:00:00Z' };

describe('SeasonsAdminApiService', () => {
  let service: SeasonsAdminApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SeasonsAdminApiService);
    http = TestBed.inject(HttpTestingController);
  });

  it('keeps list and detail endpoints credentialed and exposes domain values', async () => {
    const list = firstValueFrom(service.list());
    const listRequest = http.expectOne(`${API_BASE_URL}/admin/seasons`);
    expect(listRequest.request.withCredentials).toBe(true);
    listRequest.flush({ ok: true, count: 1, items: [wireItem] });
    await expect(list).resolves.toEqual([expect.objectContaining({ coverImageUrl: null })]);

    const detail = firstValueFrom(service.get('one/two'));
    http.expectOne(`${API_BASE_URL}/admin/seasons/one%2Ftwo`).flush({ ok: true, item: wireItem });
    await expect(detail).resolves.toMatchObject({ slug: 'one' });
  });

  it('maps create commands and preserves lifecycle endpoints', async () => {
    const created = firstValueFrom(service.create({ slug: 'one', name: 'One', description: null, coverImageUrl: null, startAt: 'start', endAt: 'end' }));
    const createRequest = http.expectOne(`${API_BASE_URL}/admin/seasons`);
    expect(createRequest.request.body).toEqual({ slug: 'one', name: 'One', description: null, cover_image_url: null, start_at: 'start', end_at: 'end' });
    createRequest.flush({ ok: true, id: 1, slug: 'one', status: 'draft' });
    await expect(created).resolves.toMatchObject({ id: 1, status: 'draft' });

    const activated = firstValueFrom(service.activate('one'));
    http.expectOne(`${API_BASE_URL}/admin/seasons/one/activate`).flush({ ok: true, slug: 'one', status: 'active' });
    await expect(activated).resolves.toMatchObject({ status: 'active' });
  });

  it('rejects malformed successful responses', async () => {
    const result = firstValueFrom(service.list());
    http.expectOne(`${API_BASE_URL}/admin/seasons`).flush({ ok: true, items: [{ ...wireItem, status: 'unknown' }] });
    await expect(result).rejects.toBeInstanceOf(SeasonsAdminContractError);
  });
});
