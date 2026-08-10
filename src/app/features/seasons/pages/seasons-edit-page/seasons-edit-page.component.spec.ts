import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SeasonsCompetitiveSummaryApiService } from '../../data-access/seasons-competitive-summary-api.service';
import { SeasonsImageUploadApiService } from '../../data-access/seasons-image-upload-api.service';
import type { AdminSeason, UpdateAdminSeasonCommand } from '../../domain/admin-season.model';
import type { SeasonCompetitiveDetail } from '../../domain/season-competitive.model';
import { SeasonsAdminStore } from '../../state/seasons-admin.store';
import { SeasonsEditPageComponent } from './seasons-edit-page.component';

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
  updatedAt: '2026-07-02T12:00:00.000Z',
};

const competitiveDetail: SeasonCompetitiveDetail = {
  generatedAt: '2026-08-10T12:00:00.000Z',
  season: {
    slug: season.slug,
    name: season.name,
    description: null,
    status: 'draft',
    startAt: season.startAt,
    endAt: season.endAt,
  },
  summary: { matches: 4, maps: 8, rounds: 120, players: 24, lastMapEndedAt: null },
};

const updateCommand: UpdateAdminSeasonCommand = {
  name: 'Season 2026 atualizada',
  description: null,
  coverImageUrl: null,
  startAt: season.startAt,
  endAt: season.endAt,
};

describe('SeasonsEditPageComponent', () => {
  let fixture: ComponentFixture<SeasonsEditPageComponent>;
  let routeSlug: string | null;
  const store = {
    error: signal<string | null>(null),
    activeMutation: signal<string | null>(null),
    resetError: vi.fn(),
    loadDetail: vi.fn<(slug: string) => Promise<AdminSeason>>(),
    update: vi.fn<(slug: string, command: UpdateAdminSeasonCommand) => Promise<unknown>>(),
  };
  const router = { navigate: vi.fn(() => Promise.resolve(true)) };
  const route = { snapshot: { paramMap: { get: vi.fn(() => routeSlug) } } };
  const competitiveApi = { detail: vi.fn(() => of(competitiveDetail)) };

  beforeEach(async () => {
    vi.clearAllMocks();
    routeSlug = 'season-2026';
    store.error.set(null);
    store.activeMutation.set(null);
    store.loadDetail.mockResolvedValue(season);
    store.update.mockResolvedValue({});
    competitiveApi.detail.mockReturnValue(of(competitiveDetail));

    await TestBed.configureTestingModule({
      imports: [SeasonsEditPageComponent],
      providers: [
        { provide: SeasonsAdminStore, useValue: store },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: SeasonsCompetitiveSummaryApiService, useValue: competitiveApi },
        { provide: SeasonsImageUploadApiService, useValue: { upload: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('loads a valid slug as an AdminSeason and enters ready state', async () => {
    await initialize();
    expect(route.snapshot.paramMap.get).toHaveBeenCalledWith('slug');
    expect(store.loadDetail).toHaveBeenCalledWith('season-2026');
    expect(fixture.componentInstance.item()).toEqual(season);
    expect(fixture.componentInstance.resolutionState()).toBe('ready');
  });

  it('rejects an empty slug without loading detail', async () => {
    routeSlug = '   ';
    await initialize();
    expect(store.loadDetail).not.toHaveBeenCalled();
    expect(fixture.componentInstance.resolutionState()).toBe('invalid-slug');
    expect(fixture.componentInstance.resolutionMessage()).toBe('Slug de season inválido.');
  });

  it('maps HTTP 404 to not-found state and administrative message', async () => {
    store.loadDetail.mockRejectedValueOnce(new HttpErrorResponse({ status: 404 }));
    await initialize();
    expect(fixture.componentInstance.resolutionState()).toBe('not-found');
    expect(fixture.componentInstance.resolutionMessage()).toBe('A season solicitada não foi encontrada.');
  });

  it('preserves the store error and supplies a fallback for generic failures', async () => {
    store.error.set('Erro mapeado pela store.');
    store.loadDetail.mockRejectedValueOnce(new Error('failure'));
    await initialize();
    expect(fixture.componentInstance.resolutionState()).toBe('error');
    expect(fixture.componentInstance.pageError()).toBe('Erro mapeado pela store.');

    store.error.set(null);
    store.loadDetail.mockRejectedValueOnce(new Error('failure'));
    await fixture.componentInstance.retry();
    expect(fixture.componentInstance.resolutionMessage()).toBe('Falha ao preparar a edição da season.');
  });

  it('retries the current slug', async () => {
    await initialize();
    await fixture.componentInstance.retry();
    expect(store.loadDetail).toHaveBeenCalledTimes(2);
    expect(store.loadDetail).toHaveBeenLastCalledWith('season-2026');
  });

  it('passes an update command to the store and navigates only after success', async () => {
    await initialize();
    await fixture.componentInstance.submit(updateCommand);
    expect(store.update).toHaveBeenCalledWith('season-2026', updateCommand);
    expect(router.navigate).toHaveBeenCalledWith(['/seasons']);

    router.navigate.mockClear();
    store.update.mockRejectedValueOnce(new Error('failure'));
    await fixture.componentInstance.submit(updateCommand);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('navigates back to seasons on cancel', async () => {
    fixture = TestBed.createComponent(SeasonsEditPageComponent);
    await fixture.componentInstance.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['/seasons']);
  });

  it('stores competitive summary domain data and exposes camelCase metadata', async () => {
    await initialize();
    expect(competitiveApi.detail).toHaveBeenCalledWith('season-2026');
    expect(fixture.componentInstance.competitiveDetail()).toEqual(competitiveDetail);
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('#season-name') as HTMLInputElement).value).toBe('Season 2026');
    expect(fixture.nativeElement.textContent).toContain('02/07/2026');
  });

  it('keeps the expected fallback when competitive summary fails', async () => {
    competitiveApi.detail.mockReturnValueOnce(throwError(() => new Error('unavailable')));
    await initialize();
    expect(fixture.componentInstance.competitiveDetail()).toBeNull();
    expect(fixture.componentInstance.competitiveError()).toBe('Resumo competitivo ainda não disponível para esta season.');
    expect(fixture.componentInstance.resolutionState()).toBe('ready');
  });

  async function initialize(): Promise<void> {
    fixture = TestBed.createComponent(SeasonsEditPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  }
});
