import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppFooter } from './app-footer';

describe('AppFooter', () => {
  let fixture: ComponentFixture<AppFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFooter],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFooter);
    fixture.detectChanges();
  });

  it('should render a contentinfo landmark', () => {
    expect(fixture.nativeElement.querySelector('footer[role="contentinfo"]')).toBeTruthy();
  });

  it('should render only institutional Backoffice content', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('High Skill Community');
    expect(text).toContain('BACKOFFICE');
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });
});
