import { describe, expect, it } from 'vitest';

import {
  buildAdminUserCreateCommand,
  validateAdminUserCreate,
} from './admin-user-create.model';

describe('admin user create model', () => {
  it('should build a normalized camelCase command', () => {
    const command = buildAdminUserCreateCommand({
      email: '  ADMIN@HSC.GG  ',
      displayName: '  Admin User  ',
      role: 'admin',
    });

    expect(command).toEqual({
      email: 'admin@hsc.gg',
      displayName: 'Admin User',
      role: 'admin',
    });
    expect(command).not.toHaveProperty('display_name');
  });

  it('should reject empty fields, invalid email and unknown role', () => {
    expect(buildAdminUserCreateCommand({ email: '', displayName: '', role: 'owner' })).toBeNull();
    expect(validateAdminUserCreate({ email: 'invalid', displayName: 'Admin', role: 'viewer' })).toEqual({
      email: 'invalid',
      displayName: null,
      role: null,
    });
    expect(validateAdminUserCreate({ email: 'admin@hsc.gg', displayName: 'Admin', role: 'owner' }).role).toBe('invalid');
  });
});
