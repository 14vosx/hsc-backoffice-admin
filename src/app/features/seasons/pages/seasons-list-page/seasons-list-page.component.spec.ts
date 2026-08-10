import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmationService } from '../../../../shared/state/confirmation.service';
import { UiFeedbackService } from '../../../../shared/state/ui-feedback.service';
import type { AdminSeason } from '../../domain/admin-season.model';
import { SeasonsAdminStore } from '../../state/seasons-admin.store';
import { SeasonsListPageComponent } from './seasons-list-page.component';

const season: AdminSeason = {
  id: 1,
  slug: 'season-2026',
  name: 'Season 2026',
  description: null,
  coverImageUrl: null,
  startAt: '2026-08-01T22:00:00.000Z',
  endAt: '2026-12-01T02:00:00.000Z',
  status: 'draft',
  createdAt: '2026-07-01T12:00:00.000Z',
  updatedAt: '2026-07-01T12:00:00.000Z',
};

describe('SeasonsListPageComponent', () => {
  let fixture: ComponentFixture<SeasonsListPageComponent>;
  const store = {
    items: signal<AdminSeason[]>([]),
    loading: signal(false),
    error: signal<string | null>(null),
    isEmpty: signal(false),
    activeMutation: signal(null),
    load: vi.fn<() => Promise<void>>(),
    activate: vi.fn<(slug: string) => Promise<unknown>>(),
    close: vi.fn<(slug: string) => Promise<unknown>>(),
  };
  const router = { navigate: vi.fn(() => Promise.resolve(true)) };
  const confirmation = { confirm: vi.fn<(data: object) => Promise<boolean>>() };
  const feedback = { success: vi.fn(), error: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    store.items.set([]);
    store.loading.set(false);
    store.error.set(null);
    store.isEmpty.set(false);
    store.activeMutation.set(null);
    store.load.mockResolvedValue(undefined);
    store.activate.mockResolvedValue({});
    store.close.mockResolvedValue({});
    confirmation.confirm.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [SeasonsListPageComponent],
      providers: [
        { provide: SeasonsAdminStore, useValue: store },
        { provide: Router, useValue: router },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: UiFeedbackService, useValue: feedback },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SeasonsListPageComponent);
  });

  it('loads through the store during initialization', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(store.load).toHaveBeenCalledOnce();
  });

  it('navigates to create and edit routes using the domain slug', () => {
    fixture.componentInstance.goToCreate();
    fixture.componentInstance.goToEdit(season);
    expect(router.navigate).toHaveBeenNthCalledWith(1, ['/seasons/new']);
    expect(router.navigate).toHaveBeenNthCalledWith(2, ['/seasons', 'season-2026', 'edit']);
  });

  it('does not activate when confirmation is cancelled', async () => {
    confirmation.confirm.mockResolvedValueOnce(false);
    await fixture.componentInstance.activateSeason(season);
    expect(store.activate).not.toHaveBeenCalled();
  });

  it('activates after confirmation and reports success', async () => {
    await fixture.componentInstance.activateSeason(season);
    expect(store.activate).toHaveBeenCalledWith('season-2026');
    expect(feedback.success).toHaveBeenCalledWith('Season ativada com sucesso.');
  });

  it('reports the store activation error and uses the fallback when absent', async () => {
    store.error.set('Erro administrativo.');
    store.activate.mockRejectedValueOnce(new Error('failure'));
    await fixture.componentInstance.activateSeason(season);
    expect(feedback.error).toHaveBeenCalledWith('Erro administrativo.');

    store.error.set(null);
    store.activate.mockRejectedValueOnce(new Error('failure'));
    await fixture.componentInstance.activateSeason(season);
    expect(feedback.error).toHaveBeenLastCalledWith('Falha ao ativar season.');
  });

  it('preserves danger confirmation and does not close when cancelled', async () => {
    confirmation.confirm.mockResolvedValueOnce(false);
    await fixture.componentInstance.closeSeason(season);
    expect(confirmation.confirm).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
    expect(store.close).not.toHaveBeenCalled();
  });

  it('closes after confirmation and reports success or the mapped error', async () => {
    await fixture.componentInstance.closeSeason(season);
    expect(store.close).toHaveBeenCalledWith('season-2026');
    expect(feedback.success).toHaveBeenCalledWith('Season fechada com sucesso.');

    store.error.set('Fechamento indisponível.');
    store.close.mockRejectedValueOnce(new Error('failure'));
    await fixture.componentInstance.closeSeason(season);
    expect(feedback.error).toHaveBeenCalledWith('Fechamento indisponível.');
  });
});
