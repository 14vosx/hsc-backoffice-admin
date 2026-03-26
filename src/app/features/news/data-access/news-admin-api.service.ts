import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import {
  AdminNewsDeleteResponse,
  AdminNewsListResponse,
  AdminNewsMutationResponse,
  CreateNewsPayload,
  CreateNewsResponse,
  UpdateNewsPayload,
} from './news-admin.models';

@Injectable({
  providedIn: 'root',
})
export class NewsAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly newsEndpoint = `${API_BASE_URL}/admin/news`;

  list(): Observable<AdminNewsListResponse> {
    return this.http.get<AdminNewsListResponse>(this.newsEndpoint, {
      withCredentials: true,
    });
  }

  create(payload: CreateNewsPayload): Observable<CreateNewsResponse> {
    return this.http.post<CreateNewsResponse>(this.newsEndpoint, payload, {
      withCredentials: true,
    });
  }

  update(id: number, payload: UpdateNewsPayload): Observable<AdminNewsMutationResponse> {
    return this.http.patch<AdminNewsMutationResponse>(
      `${this.newsEndpoint}/${id}`,
      payload,
      {
        withCredentials: true,
      },
    );
  }

  publish(id: number): Observable<AdminNewsMutationResponse> {
    return this.http.post<AdminNewsMutationResponse>(
      `${this.newsEndpoint}/${id}/publish`,
      {},
      {
        withCredentials: true,
      },
    );
  }

  unpublish(id: number): Observable<AdminNewsMutationResponse> {
    return this.http.post<AdminNewsMutationResponse>(
      `${this.newsEndpoint}/${id}/unpublish`,
      {},
      {
        withCredentials: true,
      },
    );
  }

  remove(id: number): Observable<AdminNewsDeleteResponse> {
    return this.http.delete<AdminNewsDeleteResponse>(`${this.newsEndpoint}/${id}`, {
      withCredentials: true,
    });
  }
}
