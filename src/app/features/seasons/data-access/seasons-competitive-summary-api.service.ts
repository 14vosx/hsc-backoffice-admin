import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { CS2_STATIC_API_BASE_URL } from '../../../core/config/api.config';
import type { SeasonCompetitiveDetail, SeasonsCompetitiveIndex } from '../domain/season-competitive.model';
import { parseSeasonCompetitiveDetail, parseSeasonsCompetitiveIndex } from './seasons-competitive-summary.contract';

@Injectable({ providedIn: 'root' })
export class SeasonsCompetitiveSummaryApiService {
  private readonly http = inject(HttpClient);

  index(): Observable<SeasonsCompetitiveIndex> {
    return this.http.get<unknown>(`${CS2_STATIC_API_BASE_URL}/seasons.json`).pipe(map(parseSeasonsCompetitiveIndex));
  }

  detail(slug: string): Observable<SeasonCompetitiveDetail> {
    return this.http
      .get<unknown>(`${CS2_STATIC_API_BASE_URL}/season/${encodeURIComponent(slug)}.json`)
      .pipe(map(parseSeasonCompetitiveDetail));
  }
}
