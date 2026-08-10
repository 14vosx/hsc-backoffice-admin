import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SeasonsImageUploadApiService } from '../../data-access/seasons-image-upload-api.service';
import type { AdminSeason } from '../../domain/admin-season.model';
import { SeasonsFormComponent } from './seasons-form.component';

const season: AdminSeason = { id: 1, slug: 'one', name: 'One', description: null, coverImageUrl: '/old.webp', startAt: '2026-01-01T12:00:00Z', endAt: '2026-02-01T12:00:00Z', status: 'draft', createdAt: 'created', updatedAt: 'updated' };

describe('SeasonsFormComponent', () => {
  let fixture: ComponentFixture<SeasonsFormComponent>;
  const upload = vi.fn(() => of({ url: '/new.webp' }));

  beforeEach(async () => {
    upload.mockReset();
    upload.mockReturnValue(of({ url: '/new.webp' }));
    await TestBed.configureTestingModule({ imports: [SeasonsFormComponent], providers: [{ provide: SeasonsImageUploadApiService, useValue: { upload } }] }).compileComponents();
    fixture = TestBed.createComponent(SeasonsFormComponent);
    fixture.detectChanges();
  });

  it('starts empty with native, labelled date and time controls and blocks required submission', async () => {
    const submitted = vi.fn();
    fixture.componentInstance.formSubmit.subscribe(submitted);
    expect(query<HTMLInputElement>('#season-start-date').type).toBe('date');
    expect(query<HTMLInputElement>('#season-start-time').type).toBe('time');
    expect(fixture.nativeElement.querySelector('label[for="season-start-date"]')).toBeTruthy();
    submitForm();
    await fixture.whenStable();
    expect(submitted).not.toHaveBeenCalled();
  });

  it('hydrates edit state, disables slug, and disables all editing for a closed season', () => {
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', season);
    fixture.detectChanges();
    expect(query<HTMLInputElement>('#season-slug').value).toBe('one');
    expect(query<HTMLInputElement>('#season-slug').disabled).toBe(true);
    fixture.componentRef.setInput('initialValue', { ...season, status: 'closed' });
    fixture.detectChanges();
    expect(query<HTMLInputElement>('#season-name').disabled).toBe(true);
  });

  it('emits a normalized create command for a valid local range and prevents submit while pending', async () => {
    const submitted = vi.fn();
    fixture.componentInstance.formSubmit.subscribe(submitted);
    setValue('#season-slug', ' season-two '); setValue('#season-name', ' Season Two ');
    setValue('#season-start-date', '2026-03-01'); setValue('#season-start-time', '10:00');
    setValue('#season-end-date', '2026-03-02'); setValue('#season-end-time', '10:00');
    submitForm(); await fixture.whenStable();
    expect(submitted).toHaveBeenCalledWith(expect.objectContaining({ slug: 'season-two', name: 'Season Two', startAt: new Date(2026, 2, 1, 10, 0).toISOString() }));
    fixture.componentRef.setInput('submitting', true); fixture.detectChanges(); submitForm(); await fixture.whenStable();
    expect(submitted).toHaveBeenCalledTimes(1);
  });

  it('handles valid upload, clear, invalid MIME, upload failure, and cancel', async () => {
    const cancelled = vi.fn();
    fixture.componentInstance.cancel.subscribe(cancelled);
    await selectFile(new File(['x'], 'cover.webp', { type: 'image/webp' }));
    expect(query<HTMLInputElement>('#season-cover-url').value).toBe('/new.webp');
    (fixture.nativeElement.querySelector('.seasons-form__button--secondary') as HTMLButtonElement).click(); fixture.detectChanges();
    expect(query<HTMLInputElement>('#season-cover-url').value).toBe('');
    await selectFile(new File(['x'], 'cover.gif', { type: 'image/gif' }));
    expect(fixture.nativeElement.textContent).toContain('Use uma imagem JPG, PNG ou WebP.');
    upload.mockReturnValueOnce(throwError(() => new Error('upload')));
    await selectFile(new File(['x'], 'cover.webp', { type: 'image/webp' }));
    expect(fixture.nativeElement.textContent).toContain('Falha ao enviar a capa');
    (fixture.nativeElement.querySelector('.seasons-form__button--quiet') as HTMLButtonElement).click();
    expect(cancelled).toHaveBeenCalled();
  });

  function query<T extends Element>(selector: string): T { return fixture.nativeElement.querySelector(selector) as T; }
  function setValue(selector: string, value: string): void { const input = query<HTMLInputElement>(selector); input.value = value; input.dispatchEvent(new Event('input')); fixture.detectChanges(); }
  function submitForm(): void { query<HTMLFormElement>('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); fixture.detectChanges(); }
  async function selectFile(file: File): Promise<void> { const input = query<HTMLInputElement>('input[type="file"]'); Object.defineProperty(input, 'files', { configurable: true, value: [file] }); input.dispatchEvent(new Event('change')); await fixture.whenStable(); fixture.detectChanges(); }
});
