import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { AdminSeasonListResponse } from './seasons-admin.models';

@Injectable({
  providedIn: 'root',
})
export class SeasonsAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly seasonsEndpoint = `${API_BASE_URL}/admin/seasons`;

  list(): Observable<AdminSeasonListResponse> {
    return this.http.get<AdminSeasonListResponse>(this.seasonsEndpoint, {
      withCredentials: true,
    });
  }
}
