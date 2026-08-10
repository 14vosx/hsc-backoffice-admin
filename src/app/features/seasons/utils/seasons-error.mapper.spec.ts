import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';

import { SeasonsAdminContractError } from '../data-access/seasons-admin.contract';
import { mapSeasonsErrorMessage } from './seasons-error.mapper';

describe('mapSeasonsErrorMessage', () => {
  it('maps known backend codes without exposing raw values', () => {
    expect(mapSeasonsErrorMessage(new HttpErrorResponse({ status: 409, error: { error: 'slug_already_exists' } }))).toBe('Já existe uma season com este slug.');
  });

  it('uses safe messages for contract and unknown backend errors', () => {
    expect(mapSeasonsErrorMessage(new SeasonsAdminContractError('internal detail'))).not.toContain('internal detail');
    expect(mapSeasonsErrorMessage(new HttpErrorResponse({ status: 500, error: { error: 'database_secret' } }))).not.toContain('database_secret');
  });
});
