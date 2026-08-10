import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import {
  isAdminUserRole,
  type AdminUser,
  type CreateAdminUserCommand,
  type UpdateAdminUserCommand,
} from '../domain/admin-user.model';

export interface AdminUsersList {
  readonly items: AdminUser[];
  readonly count: number;
}

export class UsersAdminContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UsersAdminContractError';
  }
}

@Injectable({
  providedIn: 'root',
})
export class UsersAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly usersEndpoint = `${API_BASE_URL}/admin/users`;

  listUsers(): Observable<AdminUsersList> {
    return this.http
      .get<unknown>(this.usersEndpoint, { withCredentials: true })
      .pipe(map((payload) => normalizeListEnvelope(payload)));
  }

  createUser(command: CreateAdminUserCommand): Observable<AdminUser> {
    return this.http
      .post<unknown>(this.usersEndpoint, toCreateWireCommand(command), { withCredentials: true })
      .pipe(map((payload) => normalizeWriteEnvelope(payload, 'create')));
  }

  updateUser(id: number, command: UpdateAdminUserCommand): Observable<AdminUser> {
    return this.http
      .patch<unknown>(`${this.usersEndpoint}/${id}`, toUpdateWireCommand(command), {
        withCredentials: true,
      })
      .pipe(map((payload) => normalizeWriteEnvelope(payload, 'update')));
  }
}

function normalizeListEnvelope(payload: unknown): AdminUsersList {
  if (!isRecord(payload) || payload['ok'] !== true) {
    throw new UsersAdminContractError('Invalid admin users list response envelope');
  }

  const count = payload['count'];
  const rawItems = payload['items'];
  if (!Number.isInteger(count) || (count as number) < 0 || !Array.isArray(rawItems)) {
    throw new UsersAdminContractError('Invalid admin users list response envelope');
  }

  const items = rawItems.map(normalizeAdminUser);
  if (items.some((item) => item === null)) {
    throw new UsersAdminContractError('Invalid admin user item in list response');
  }

  return { items: items as AdminUser[], count: count as number };
}

function normalizeWriteEnvelope(payload: unknown, operation: 'create' | 'update'): AdminUser {
  if (!isRecord(payload) || payload['ok'] !== true) {
    throw new UsersAdminContractError(`Invalid admin user ${operation} response envelope`);
  }

  const item = normalizeAdminUser(payload['item']);
  if (!item) {
    throw new UsersAdminContractError(`Invalid admin user ${operation} response item`);
  }
  return item;
}

function normalizeAdminUser(payload: unknown): AdminUser | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = payload['id'];
  const email = requiredString(payload['email']);
  const displayName = optionalString(payload['display_name']);
  const role = payload['role'];
  const createdAt = optionalString(payload['created_at']);
  const updatedAt = optionalString(payload['updated_at']);

  if (
    !Number.isInteger(id) ||
    (id as number) <= 0 ||
    !email ||
    displayName === undefined ||
    !isAdminUserRole(role) ||
    createdAt === undefined ||
    updatedAt === undefined
  ) {
    return null;
  }

  return {
    id: id as number,
    email,
    displayName,
    role,
    createdAt,
    updatedAt,
  };
}

function toCreateWireCommand(command: CreateAdminUserCommand): Record<string, unknown> {
  return {
    email: command.email,
    display_name: command.displayName,
    role: command.role,
  };
}

function toUpdateWireCommand(command: UpdateAdminUserCommand): Record<string, unknown> {
  return {
    ...('email' in command ? { email: command.email } : {}),
    ...('displayName' in command ? { display_name: command.displayName } : {}),
    ...('role' in command ? { role: command.role } : {}),
  };
}

function requiredString(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() || null : null;
}

function optionalString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }
  return typeof value === 'string' ? value.trim() || null : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
