import type { AdminUserRole, CreateAdminUserCommand } from '../../domain/admin-user.model';
import { isAdminUserRole } from '../../domain/admin-user.model';

export interface AdminUserCreateEditModel {
  readonly email: string;
  readonly displayName: string;
  readonly role: unknown;
}

export interface AdminUserCreateValidation {
  readonly email: 'required' | 'invalid' | null;
  readonly displayName: 'required' | null;
  readonly role: 'invalid' | null;
}

export function validateAdminUserCreate(
  editModel: AdminUserCreateEditModel,
): AdminUserCreateValidation {
  const email = editModel.email.trim();
  const displayName = editModel.displayName.trim();

  return {
    email: !email ? 'required' : isValidEmail(email) ? null : 'invalid',
    displayName: displayName ? null : 'required',
    role: isAdminUserRole(editModel.role) ? null : 'invalid',
  };
}

export function buildAdminUserCreateCommand(
  editModel: AdminUserCreateEditModel,
): CreateAdminUserCommand | null {
  const validation = validateAdminUserCreate(editModel);
  if (validation.email || validation.displayName || validation.role) {
    return null;
  }

  return {
    email: editModel.email.trim().toLowerCase(),
    displayName: editModel.displayName.trim(),
    role: editModel.role as AdminUserRole,
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
