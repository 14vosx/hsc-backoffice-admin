import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { CS2_STATIC_API_BASE_URL } from '../../../core/config/api.config';
import { SeasonsCompetitiveSummaryApiService } from './seasons-competitive-summary-api.service';

describe('SeasonsCompetitiveSummaryApiService', () => {
  let service: SeasonsCompetitiveSummaryApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SeasonsCompetitiveSummaryApiService);
    http = TestBed.inject(HttpTestingController);
  });

  it('normalizes static detail fields without adding credentials', async () => {
    const result = firstValueFrom(service.detail('one/two'));
    const request = http.expectOne(`${CS2_STATIC_API_BASE_URL}/season/one%2Ftwo.json`);
    expect(request.request.withCredentials).toBe(false);
    request.flush({ generatedAt: '2026-01-01 00:00:00', season: { slug: 'one', name: 'One', description: null, status: 'active', start_at: '2026-01-01 00:00:00', end_at: '2026-02-01 00:00:00' }, summary: { matches: 1, maps: 2, rounds: 3, players: 4, lastMapEndedAt: '2026-01-20 10:30:00' } });
    await expect(result).resolves.toMatchObject({ generatedAt: '2026-01-01T00:00:00Z', season: { startAt: '2026-01-01T00:00:00Z', endAt: '2026-02-01T00:00:00Z' }, summary: { matches: 1, lastMapEndedAt: '2026-01-20T10:30:00Z' } });
  });
});
