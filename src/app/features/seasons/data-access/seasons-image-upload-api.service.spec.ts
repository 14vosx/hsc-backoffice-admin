import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { API_BASE_URL } from '../../../core/config/api.config';
import { SeasonsAdminContractError } from './seasons-admin.contract';
import { SeasonsImageUploadApiService } from './seasons-image-upload-api.service';

describe('SeasonsImageUploadApiService', () => {
  let service: SeasonsImageUploadApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SeasonsImageUploadApiService);
    http = TestBed.inject(HttpTestingController);
  });

  it('keeps the upload contract and validates its URL', async () => {
    const result = firstValueFrom(service.upload(new File(['x'], 'cover.webp', { type: 'image/webp' })));
    const request = http.expectOne(`${API_BASE_URL}/admin/uploads`);
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toBeInstanceOf(FormData);
    request.flush({ ok: true, url: '/uploads/cover.webp' });
    await expect(result).resolves.toEqual({ url: '/uploads/cover.webp' });
  });

  it('rejects a successful response without a usable URL', async () => {
    const result = firstValueFrom(service.upload(new File(['x'], 'cover.webp')));
    http.expectOne(`${API_BASE_URL}/admin/uploads`).flush({ ok: true, url: '' });
    await expect(result).rejects.toBeInstanceOf(SeasonsAdminContractError);
  });
});
