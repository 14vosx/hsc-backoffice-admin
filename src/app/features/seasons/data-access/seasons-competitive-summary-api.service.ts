import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CS2_STATIC_API_BASE_URL } from '../../../core/config/api.config';
import {
  SeasonCompetitiveDetailResponse,
  SeasonsCompetitiveIndexResponse,
} from './seasons-competitive-summary.models';

@Injectable({ providedIn: 'root' })
export class SeasonsCompetitiveSummaryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = CS2_STATIC_API_BASE_URL;

  index(): Observable<SeasonsCompetitiveIndexResponse> {
    return this.http.get<SeasonsCompetitiveIndexResponse>(`${this.baseUrl}/seasons.json`);
  }

  detail(slug: string): Observable<SeasonCompetitiveDetailResponse> {
    return this.http.get<SeasonCompetitiveDetailResponse>(
      `${this.baseUrl}/season/${encodeURIComponent(slug)}.json`,
    );
  }
}
