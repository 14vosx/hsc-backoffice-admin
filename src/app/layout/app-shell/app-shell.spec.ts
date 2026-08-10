import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthSessionStore } from '../../core/auth/auth-session.store';
import { AppShell } from './app-shell';

@Component({
  template: '<h1>Dashboard</h1>',
  changeDetection: ChangeDetectionStrategy.Eager,
})
class TestPageComponent {}

describe('AppShell', () => {
  let fixture: ComponentFixture<AppShell>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell, TestPageComponent],
      providers: [
        provideRouter([
          { path: 'dashboard', component: TestPageComponent },
          { path: 'seasons', component: TestPageComponent },
        ]),
        {
          provide: AuthSessionStore,
          useValue: {
            status: signal('authenticated'),
            role: signal('admin'),
            user: signal({ name: 'Admin' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShell);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should render the accessible application structure', () => {
    const native = fixture.nativeElement;
    expect(native.querySelector('.skip-link')?.getAttribute('href')).toBe('#main-content');
    expect(native.querySelector('app-header')).toBeTruthy();
    expect(native.querySelector('.app-shell__sidebar-desktop app-sidebar')).toBeTruthy();
    expect(native.querySelector('main#main-content')).toBeTruthy();
    expect(native.querySelector('app-footer')).toBeTruthy();
    expect(native.querySelector('app-confirmation-dialog')).toBeTruthy();
    expect(native.querySelector('app-input-dialog')).toBeTruthy();
    expect(native.querySelector('app-feedback-center')).toBeTruthy();
  });

  it('should open and close the accessible drawer while restoring scroll', () => {
    document.body.style.overflow = 'visible';
    const toggleButton = fixture.nativeElement.querySelector('.app-header__toggle') as HTMLButtonElement;

    toggleButton.click();
    fixture.detectChanges();

    const drawer = fixture.nativeElement.querySelector('#mobile-drawer');
    expect(drawer.getAttribute('role')).toBe('dialog');
    expect(drawer.getAttribute('aria-modal')).toBe('true');
    expect(drawer.getAttribute('cdktrapfocus')).toBeDefined();
    expect(document.body.style.overflow).toBe('hidden');
    expect(toggleButton.getAttribute('aria-expanded')).toBe('true');

    fixture.nativeElement.querySelector('.app-shell__backdrop').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#mobile-drawer')).toBeNull();
    expect(document.body.style.overflow).toBe('visible');
    expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
  });

  it('should return focus to the drawer trigger when closed', () => {
    const toggleButton = fixture.nativeElement.querySelector('.app-header__toggle') as HTMLButtonElement;
    toggleButton.focus();
    toggleButton.click();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.app-shell__backdrop').click();
    fixture.detectChanges();

    expect(document.activeElement).toBe(toggleButton);
  });

  it('should close the drawer on Escape', () => {
    const toggleButton = fixture.nativeElement.querySelector('.app-header__toggle') as HTMLButtonElement;
    toggleButton.click();
    fixture.detectChanges();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#mobile-drawer')).toBeNull();
  });

  it('should close the drawer after navigation', async () => {
    const toggleButton = fixture.nativeElement.querySelector('.app-header__toggle') as HTMLButtonElement;
    toggleButton.click();
    fixture.detectChanges();

    await router.navigateByUrl('/seasons');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#mobile-drawer')).toBeNull();
  });
});
