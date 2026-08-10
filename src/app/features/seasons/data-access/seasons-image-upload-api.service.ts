import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { SeasonsAdminContractError } from './seasons-admin.contract';

export type SeasonImageUploadResult = { url: string };

@Injectable({ providedIn: 'root' })
export class SeasonsImageUploadApiService {
  private readonly http = inject(HttpClient);

  upload(file: File): Observable<SeasonImageUploadResult> {
    const body = new FormData();
    body.append('file', file);
    return this.http
      .post<unknown>(`${API_BASE_URL}/admin/uploads`, body, { withCredentials: true })
      .pipe(map(parseUploadResult));
  }
}

function parseUploadResult(value: unknown): SeasonImageUploadResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new SeasonsAdminContractError('Resposta inválida do upload de capa.');
  }
  const url = (value as Record<string, unknown>)['url'];
  if (typeof url !== 'string' || !url.trim()) {
    throw new SeasonsAdminContractError('URL inválida no upload de capa.');
  }
  return { url };
}
