import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import type { AdminSeason, AdminSeasonStatus } from '../../domain/admin-season.model';
import { SeasonsTableComponent } from './seasons-table.component';

describe('SeasonsTableComponent', () => {
  it.each([
    ['draft', ['Editar', 'Ativar']],
    ['active', ['Editar', 'Fechar']],
    ['closed', []],
  ] as const)('renders valid actions for %s and emits the selected season', (status, labels) => {
    const fixture = TestBed.createComponent(SeasonsTableComponent);
    const item = season(status);
    const edit = vi.fn(); const activate = vi.fn(); const close = vi.fn();
    fixture.componentInstance.edit.subscribe(edit); fixture.componentInstance.activate.subscribe(activate); fixture.componentInstance.close.subscribe(close);
    fixture.componentRef.setInput('items', [item]); fixture.detectChanges();
    const buttons = [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[];
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(labels);
    buttons[0]?.click();
    const expected = status === 'draft' || status === 'active' ? edit : null;
    if (expected) expect(expected).toHaveBeenCalledWith(item);
  });

  it('disables every action while another mutation is active', () => {
    const fixture = TestBed.createComponent(SeasonsTableComponent);
    fixture.componentRef.setInput('items', [season('draft')]); fixture.componentRef.setInput('actionsDisabled', true); fixture.detectChanges();
    expect([...fixture.nativeElement.querySelectorAll('button')].every((button: HTMLButtonElement) => button.disabled)).toBe(true);
  });
});

function season(status: AdminSeasonStatus): AdminSeason {
  return { id: 1, slug: 'one', name: 'One', description: null, coverImageUrl: null, startAt: '2026-08-01T18:00:00.000Z', endAt: '2026-12-01T02:00:00.000Z', status, createdAt: '2026-08-01T12:00:00.000Z', updatedAt: '2026-08-10T15:00:00.000Z' };
}
