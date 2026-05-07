import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { AdminSeasonImageUploadResponse } from './seasons-admin.models';

@Injectable({
  providedIn: 'root',
})
export class SeasonsImageUploadApiService {
  private readonly http = inject(HttpClient);
  private readonly uploadEndpoint = `${API_BASE_URL}/admin/uploads`;

  upload(file: File): Observable<AdminSeasonImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<AdminSeasonImageUploadResponse>(this.uploadEndpoint, formData, {
      withCredentials: true,
    });
  }
}
