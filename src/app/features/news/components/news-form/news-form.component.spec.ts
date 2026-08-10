import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NewsImageUploadApiService } from '../../data-access/news-image-upload-api.service';
import { NewsFormComponent } from './news-form.component';

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
    const component = fixture.componentInstance;
    const submitted = vi.fn();
    component.formSubmit.subscribe(submitted);
    component.onSubmit();
    fixture.detectChanges();

    expect(submitted).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('label[for="news-slug"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('label[for="news-title"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('label[for="news-content"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#news-title-error')).toBeTruthy();
  });

  it('should emit the same form value for a valid native form', () => {
    const component = fixture.componentInstance;
    const submitted = vi.fn();
    component.formSubmit.subscribe(submitted);
    component.form.setValue({ slug: 'update', title: 'Title', content: 'Content', image_url: null });
    component.onSubmit();

    expect(submitted).toHaveBeenCalledWith({ slug: 'update', title: 'Title', content: 'Content', image_url: null });
  });

  it('should preserve disabled slug behavior in edit mode', () => {
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', { slug: 'fixed', title: 'Title', content: 'Content', image_url: null });
    fixture.detectChanges();

    const slug = fixture.nativeElement.querySelector('#news-slug') as HTMLInputElement;
    expect(slug.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('#news-slug-hint')).toBeTruthy();
  });
});
