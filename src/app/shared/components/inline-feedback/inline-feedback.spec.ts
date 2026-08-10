import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { InlineFeedback } from './inline-feedback';

@Component({
  template: '<app-inline-feedback [variant]="variant">Projected message</app-inline-feedback>',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [InlineFeedback],
})
class TestHostComponent {
  variant: 'neutral' | 'error' | 'success' | 'warning' = 'neutral';
}

describe('InlineFeedback', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should project content and apply each variant', () => {
    const host = fixture.nativeElement.querySelector('app-inline-feedback');
    expect(host.textContent.trim()).toBe('Projected message');

    for (const variant of ['neutral', 'error', 'success', 'warning'] as const) {
      fixture.componentInstance.variant = variant;
      fixture.detectChanges();
      expect(host.classList.contains(`inline-feedback--${variant}`)).toBe(true);
    }
  });

  it('should announce errors assertively and other variants politely', () => {
    const host = fixture.nativeElement.querySelector('app-inline-feedback');
    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-live')).toBe('polite');

    fixture.componentInstance.variant = 'error';
    fixture.detectChanges();

    expect(host.getAttribute('role')).toBe('alert');
    expect(host.getAttribute('aria-live')).toBe('assertive');
  });
});
