import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import type {
  AdminSeason,
  AdminSeasonCreateResult,
  AdminSeasonLifecycleResult,
  AdminSeasonUpdateResult,
  CreateAdminSeasonCommand,
  UpdateAdminSeasonCommand,
} from '../domain/admin-season.model';
import {
  parseSeasonCreateResult,
  parseSeasonDetail,
  parseSeasonLifecycleResult,
  parseSeasonList,
  parseSeasonUpdateResult,
  toCreateSeasonPayload,
  toUpdateSeasonPayload,
} from './seasons-admin.contract';

@Injectable({ providedIn: 'root' })
export class SeasonsAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly seasonsEndpoint = `${API_BASE_URL}/admin/seasons`;

  list(): Observable<AdminSeason[]> {
    return this.http.get<unknown>(this.seasonsEndpoint, { withCredentials: true }).pipe(map(parseSeasonList));
  }

  get(slug: string): Observable<AdminSeason> {
    return this.http
      .get<unknown>(`${this.seasonsEndpoint}/${encodeURIComponent(slug)}`, { withCredentials: true })
      .pipe(map(parseSeasonDetail));
  }

  create(command: CreateAdminSeasonCommand): Observable<AdminSeasonCreateResult> {
    return this.http
      .post<unknown>(this.seasonsEndpoint, toCreateSeasonPayload(command), { withCredentials: true })
      .pipe(map(parseSeasonCreateResult));
  }

  update(slug: string, command: UpdateAdminSeasonCommand): Observable<AdminSeasonUpdateResult> {
    return this.http
      .patch<unknown>(`${this.seasonsEndpoint}/${encodeURIComponent(slug)}`, toUpdateSeasonPayload(command), {
        withCredentials: true,
      })
      .pipe(map(parseSeasonUpdateResult));
  }

  activate(slug: string): Observable<AdminSeasonLifecycleResult> {
    return this.lifecycle(slug, 'activate');
  }

  close(slug: string): Observable<AdminSeasonLifecycleResult> {
    return this.lifecycle(slug, 'close');
  }

  private lifecycle(slug: string, action: 'activate' | 'close'): Observable<AdminSeasonLifecycleResult> {
    return this.http
      .post<unknown>(`${this.seasonsEndpoint}/${encodeURIComponent(slug)}/${action}`, {}, { withCredentials: true })
      .pipe(map(parseSeasonLifecycleResult));
  }
}
