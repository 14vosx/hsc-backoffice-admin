import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { UiFeedbackService } from '../../state/ui-feedback.service';
import { FeedbackCenter } from './feedback-center';

describe('FeedbackCenter', () => {
  let fixture: ComponentFixture<FeedbackCenter>;
  let service: UiFeedbackService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FeedbackCenter] }).compileComponents();
    fixture = TestBed.createComponent(FeedbackCenter);
    service = TestBed.inject(UiFeedbackService);
    fixture.detectChanges();
  });

  it('should show and dismiss the current message', () => {
    service.success('Saved successfully');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Saved successfully');
    expect(fixture.nativeElement.querySelector('.feedback-center').getAttribute('aria-live')).toBe('polite');

    fixture.nativeElement.querySelector('.feedback-center__close').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.feedback-center')).toBeNull();
  });

  it('should announce errors assertively', () => {
    service.error('Save failed');
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('.feedback-center');
    expect(message.getAttribute('role')).toBe('alert');
    expect(message.getAttribute('aria-live')).toBe('assertive');
  });
});
