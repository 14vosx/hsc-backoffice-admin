import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
export type NewsImageUploadResult = { url: string };

export class NewsImageUploadContractError extends Error {
  constructor() {
    super('Resposta de upload de news inválida.');
    this.name = 'NewsImageUploadContractError';
  }
}

export function parseNewsImageUploadResult(value: unknown): NewsImageUploadResult {
  if (typeof value !== 'object' || value === null || !('ok' in value) || value.ok !== true || !('url' in value) || typeof value.url !== 'string') {
    throw new NewsImageUploadContractError();
  }
  return { url: value.url };
}

@Injectable({
  providedIn: 'root',
})
export class NewsImageUploadApiService {
  private readonly http = inject(HttpClient);
  private readonly uploadEndpoint = `${API_BASE_URL}/admin/uploads`;

  upload(file: File): Observable<NewsImageUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<unknown>(this.uploadEndpoint, formData, {
      withCredentials: true,
    }).pipe(map(parseNewsImageUploadResult));
  }
}
