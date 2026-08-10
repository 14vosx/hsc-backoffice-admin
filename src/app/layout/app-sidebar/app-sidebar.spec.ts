import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppSidebar } from './app-sidebar';

@Component({
  template: '<app-sidebar [isMobileDrawer]="isMobile" (closeRequested)="onClose()" />',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AppSidebar],
})
class TestHostComponent {
  isMobile = false;
  closed = false;

  onClose(): void {
    this.closed = true;
  }
}

describe('AppSidebar', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, AppSidebar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should render Backoffice branding and primary navigation', () => {
    expect(fixture.nativeElement.textContent).toContain('HSC');
    expect(fixture.nativeElement.textContent).toContain('Backoffice');
    expect(fixture.nativeElement.querySelector('app-primary-nav')).toBeTruthy();
  });

  it('should not render a close button in permanent mode', () => {
    expect(fixture.nativeElement.querySelector('.app-sidebar__close-btn')).toBeNull();
  });

  it('should emit closeRequested from the mobile drawer close button', () => {
    fixture.componentInstance.isMobile = true;
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.app-sidebar__close-btn').click();
    expect(fixture.componentInstance.closed).toBe(true);
  });
});
