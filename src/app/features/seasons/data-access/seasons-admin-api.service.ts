import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_BASE_URL } from '../../../core/config/api.config';
import {
  AdminSeasonDetailResponse,
  AdminSeasonLifecycleResponse,
  AdminSeasonListResponse,
  AdminSeasonListItem,
  AdminSeasonUpdateResponse,
  CreateSeasonPayload,
  CreateSeasonResponse,
  UpdateSeasonPayload,
} from './seasons-admin.models';

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

  get(slug: string): Observable<AdminSeasonListItem> {
    return this.http
      .get<AdminSeasonDetailResponse>(`${this.seasonsEndpoint}/${encodeURIComponent(slug)}`, {
        withCredentials: true,
      })
      .pipe(map((response) => response.item));
  }

  create(payload: CreateSeasonPayload): Observable<CreateSeasonResponse> {
    return this.http.post<CreateSeasonResponse>(this.seasonsEndpoint, payload, {
      withCredentials: true,
    });
  }

  update(slug: string, payload: UpdateSeasonPayload): Observable<AdminSeasonUpdateResponse> {
    return this.http.patch<AdminSeasonUpdateResponse>(
      `${this.seasonsEndpoint}/${encodeURIComponent(slug)}`,
      payload,
      {
        withCredentials: true,
      },
    );
  }

  activate(slug: string): Observable<AdminSeasonLifecycleResponse> {
    return this.http.post<AdminSeasonLifecycleResponse>(
      `${this.seasonsEndpoint}/${encodeURIComponent(slug)}/activate`,
      {},
      {
        withCredentials: true,
      },
    );
  }

  close(slug: string): Observable<AdminSeasonLifecycleResponse> {
    return this.http.post<AdminSeasonLifecycleResponse>(
      `${this.seasonsEndpoint}/${encodeURIComponent(slug)}/close`,
      {},
      {
        withCredentials: true,
      },
    );
  }
}
