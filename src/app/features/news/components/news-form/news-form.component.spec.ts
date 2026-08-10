import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NewsImageUploadApiService } from '../../data-access/news-image-upload-api.service';
import type { AdminNewsDetail } from '../../domain/admin-news.model';
import { NewsFormComponent } from './news-form.component';

const detail: AdminNewsDetail = {
  id: 1, slug: 'fixed', title: 'Title', excerpt: null, content: 'Content', imageUrl: null,
  status: 'draft', publishedAt: null, createdAt: '2026-08-01T12:00:00.000Z', updatedAt: '2026-08-10T15:00:00.000Z',
};

describe('NewsFormComponent', () => {
  let fixture: ComponentFixture<NewsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsFormComponent],
      providers: [{ provide: NewsImageUploadApiService, useValue: { upload: vi.fn(() => of({ url: '/image.webp' })) } }],
    }).compileComponents();
    fixture = TestBed.createComponent(NewsFormComponent);
    fixture.detectChanges();
  });

  it('should expose native labelled fields and keep invalid submission blocked', () => {
    const submitted = vi.fn();
    fixture.componentInstance.formSubmit.subscribe(submitted);
    const formElement = fixture.nativeElement.querySelector('form');
    formElement.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(submitted).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('label[for="news-slug"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('label[for="news-title"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('label[for="news-content"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.news-form__error')).toBeTruthy();
  });

  it('should emit a normalized create command for a valid native form', async () => {
    const submitted = vi.fn();
    fixture.componentInstance.formSubmit.subscribe(submitted);
    for (const [selector, value] of [['#news-slug', ' update '], ['#news-title', ' Title '], ['#news-content', 'Content']]) {
      const control = fixture.nativeElement.querySelector(selector);
      control.value = value;
      control.dispatchEvent(new Event('input'));
    }
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(submitted).toHaveBeenCalledWith({ slug: 'update', title: 'Title', content: 'Content', imageUrl: null });
  });

  it('should preserve disabled slug behavior in edit mode', () => {
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', detail);
    fixture.detectChanges();

    const slug = fixture.nativeElement.querySelector('#news-slug');
    expect(slug.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.news-form__hint')).toBeTruthy();
  });
});
