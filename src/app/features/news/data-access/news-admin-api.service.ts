import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import type { AdminNews, AdminNewsCreateResult, AdminNewsDeleteResult, AdminNewsDetail, CreateAdminNewsCommand, UpdateAdminNewsCommand } from '../domain/admin-news.model';
import { parseAdminNewsCreate, parseAdminNewsDelete, parseAdminNewsDetail, parseAdminNewsList, parseAdminNewsMutation, toCreateAdminNewsWire, toUpdateAdminNewsWire } from './news-admin.contract';

@Injectable({
  providedIn: 'root',
})
export class NewsAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly newsEndpoint = `${API_BASE_URL}/admin/news`;

  list(): Observable<AdminNews[]> {
    return this.http.get<unknown>(this.newsEndpoint, {
      withCredentials: true,
    }).pipe(map(parseAdminNewsList));
  }

  get(id: number): Observable<AdminNewsDetail> {
    return this.http
      .get<unknown>(`${this.newsEndpoint}/${id}`, {
        withCredentials: true,
      })
      .pipe(map(parseAdminNewsDetail));
  }

  create(command: CreateAdminNewsCommand): Observable<AdminNewsCreateResult> {
    return this.http.post<unknown>(this.newsEndpoint, toCreateAdminNewsWire(command), {
      withCredentials: true,
    }).pipe(map(parseAdminNewsCreate));
  }

  update(id: number, command: UpdateAdminNewsCommand): Observable<AdminNews> {
    return this.http.patch<unknown>(
      `${this.newsEndpoint}/${id}`,
      toUpdateAdminNewsWire(command),
      {
        withCredentials: true,
      },
    ).pipe(map(parseAdminNewsMutation));
  }

  publish(id: number): Observable<AdminNews> {
    return this.http.post<unknown>(
      `${this.newsEndpoint}/${id}/publish`,
      {},
      {
        withCredentials: true,
      },
    ).pipe(map(parseAdminNewsMutation));
  }

  unpublish(id: number): Observable<AdminNews> {
    return this.http.post<unknown>(
      `${this.newsEndpoint}/${id}/unpublish`,
      {},
      {
        withCredentials: true,
      },
    ).pipe(map(parseAdminNewsMutation));
  }

  remove(id: number): Observable<AdminNewsDeleteResult> {
    return this.http.delete<unknown>(`${this.newsEndpoint}/${id}`, {
      withCredentials: true,
    }).pipe(map(parseAdminNewsDelete));
  }
}
