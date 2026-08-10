import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SeasonsAdminApiService } from '../data-access/seasons-admin-api.service';
import type { AdminSeason } from '../domain/admin-season.model';
import { SeasonsAdminStore } from './seasons-admin.store';

const item: AdminSeason = { id: 1, slug: 'one', name: 'One', description: null, coverImageUrl: null, startAt: 'start', endAt: 'end', status: 'draft', createdAt: 'created', updatedAt: 'updated' };

describe('SeasonsAdminStore', () => {
  const api = {
    list: vi.fn(() => of([item])),
    get: vi.fn(() => of(item)),
    create: vi.fn(() => of({ id: 1, slug: 'one', status: 'draft' as const })),
    update: vi.fn(() => of({ slug: 'one' })),
    activate: vi.fn(() => of({ slug: 'one', status: 'active' as const })),
    close: vi.fn(() => of({ slug: 'one', status: 'closed' as const })),
  };
  let store: SeasonsAdminStore;

  beforeEach(() => {
    Object.values(api).forEach((mock) => mock.mockClear());
    TestBed.configureTestingModule({ providers: [SeasonsAdminStore, { provide: SeasonsAdminApiService, useValue: api }] });
    store = TestBed.inject(SeasonsAdminStore);
  });

  it('loads domain items and derives empty state', async () => {
    await store.load();
    expect(store.items()).toEqual([item]);
    expect(store.isEmpty()).toBe(false);
  });

  it('passes domain commands to the API and refreshes after mutation', async () => {
    const command = { slug: 'one', name: 'One', description: null, coverImageUrl: null, startAt: 'start', endAt: 'end' };
    await store.create(command);
    expect(api.create).toHaveBeenCalledWith(command);
    expect(api.list).toHaveBeenCalled();
    expect(store.activeMutation()).toBeNull();
  });

  it('maps errors and always clears pending state', async () => {
    api.activate.mockReturnValueOnce(throwError(() => new Error('failure')) as never);
    await expect(store.activate('one')).rejects.toThrow('failure');
    expect(store.error()).toBeTruthy();
    expect(store.activeMutation()).toBeNull();
  });
});
