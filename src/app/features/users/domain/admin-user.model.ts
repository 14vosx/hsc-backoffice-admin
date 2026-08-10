export const ADMIN_USER_ROLES = ['admin', 'editor', 'viewer'] as const;

export type AdminUserRole = (typeof ADMIN_USER_ROLES)[number];

export interface AdminUser {
  readonly id: number;
  readonly email: string;
  readonly displayName: string | null;
  readonly role: AdminUserRole;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}

export interface CreateAdminUserCommand {
  readonly email: string;
  readonly displayName: string;
  readonly role: AdminUserRole;
}

export interface UpdateAdminUserCommand {
  readonly email?: string;
  readonly displayName?: string;
  readonly role?: AdminUserRole;
}

export function isAdminUserRole(value: unknown): value is AdminUserRole {
  return typeof value === 'string' && ADMIN_USER_ROLES.some((role) => role === value);
}
