import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';

export type AdminUserRole = 'viewer' | 'editor' | 'admin';

export type AdminUserListItem = {
  id: number;
  email: string;
  display_name: string | null;
  role: AdminUserRole;
  created_at: string | null;
  updated_at: string | null;
};

type AdminUsersListResponse = {
  ok: boolean;
  count: number;
  items: AdminUserListItem[];
};

type AdminUserWriteResponse = {
  ok: boolean;
  item: AdminUserListItem;
};

export type CreateAdminUserInput = {
  email: string;
  display_name: string;
  role: AdminUserRole;
};

export type UpdateAdminUserInput = Partial<{
  email: string;
  display_name: string;
  role: AdminUserRole;
}>;

@Injectable({
  providedIn: 'root',
})
export class UsersAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly usersEndpoint = `${API_BASE_URL}/admin/users`;

  listUsers(): Observable<AdminUsersListResponse> {
    return this.http.get<AdminUsersListResponse>(this.usersEndpoint, {
      withCredentials: true,
    });
  }

  createUser(input: CreateAdminUserInput): Observable<AdminUserWriteResponse> {
    return this.http.post<AdminUserWriteResponse>(this.usersEndpoint, input, {
      withCredentials: true,
    });
  }

  updateUser(id: number, input: UpdateAdminUserInput): Observable<AdminUserWriteResponse> {
    return this.http.patch<AdminUserWriteResponse>(`${this.usersEndpoint}/${id}`, input, {
      withCredentials: true,
    });
  }
}
