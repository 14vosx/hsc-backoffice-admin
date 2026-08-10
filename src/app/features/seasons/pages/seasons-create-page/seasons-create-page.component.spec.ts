import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SeasonsImageUploadApiService } from '../../data-access/seasons-image-upload-api.service';
import type { CreateAdminSeasonCommand } from '../../domain/admin-season.model';
import { SeasonsAdminStore } from '../../state/seasons-admin.store';
import { SeasonsCreatePageComponent } from './seasons-create-page.component';

const command: CreateAdminSeasonCommand = {
  slug: 'season-2026',
  name: 'Season 2026',
  description: null,
  coverImageUrl: null,
  startAt: '2026-08-01T22:00:00.000Z',
  endAt: '2026-12-01T02:00:00.000Z',
};

describe('SeasonsCreatePageComponent', () => {
  let fixture: ComponentFixture<SeasonsCreatePageComponent>;
  const store = {
    error: signal<string | null>(null),
    activeMutation: signal<string | null>(null),
    resetError: vi.fn(),
    create: vi.fn<(value: CreateAdminSeasonCommand) => Promise<unknown>>(),
  };
  const router = { navigate: vi.fn(() => Promise.resolve(true)) };

  beforeEach(async () => {
    vi.clearAllMocks();
    store.error.set(null);
    store.activeMutation.set(null);
    store.create.mockResolvedValue({});
    await TestBed.configureTestingModule({
      imports: [SeasonsCreatePageComponent],
      providers: [
        { provide: SeasonsAdminStore, useValue: store },
        { provide: Router, useValue: router },
        { provide: SeasonsImageUploadApiService, useValue: { upload: vi.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SeasonsCreatePageComponent);
  });

  it('clears the store error on initialization', () => {
    fixture.detectChanges();
    expect(store.resetError).toHaveBeenCalledOnce();
  });

  it('derives submitting only from the create mutation', () => {
    expect(fixture.componentInstance.submitting()).toBe(false);
    store.activeMutation.set('update');
    expect(fixture.componentInstance.submitting()).toBe(false);
    store.activeMutation.set('create');
    expect(fixture.componentInstance.submitting()).toBe(true);
  });

  it('passes the application command to the store and navigates after success', async () => {
    await fixture.componentInstance.submit(command);
    expect(store.create).toHaveBeenCalledWith(command);
    expect(router.navigate).toHaveBeenCalledWith(['/seasons']);
  });

  it('does not navigate when creation fails', async () => {
    store.create.mockRejectedValueOnce(new Error('failure'));
    await fixture.componentInstance.submit(command);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('navigates back to seasons on cancel', async () => {
    await fixture.componentInstance.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['/seasons']);
  });
});
