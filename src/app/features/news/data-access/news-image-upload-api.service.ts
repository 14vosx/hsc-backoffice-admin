import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { AdminNewsImageUploadResponse } from './news-admin.models';

@Injectable({
  providedIn: 'root',
})
export class NewsImageUploadApiService {
  private readonly http = inject(HttpClient);
  private readonly uploadEndpoint = `${API_BASE_URL}/admin/uploads`;

  upload(file: File): Observable<AdminNewsImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<AdminNewsImageUploadResponse>(this.uploadEndpoint, formData, {
      withCredentials: true,
    });
  }
}
