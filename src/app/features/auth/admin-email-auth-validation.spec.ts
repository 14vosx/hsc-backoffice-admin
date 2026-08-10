import { describe, expect, it } from 'vitest';

import { normalizeAdminEmail } from './admin-email-auth-validation';

describe('normalizeAdminEmail', () => {
  it('should trim and lowercase administrative email identity', () => {
    expect(normalizeAdminEmail('  ADMIN@HSC.GG  ')).toBe('admin@hsc.gg');
  });

  it('should reject an empty value', () => {
    expect(normalizeAdminEmail('   ')).toBeNull();
  });
});
