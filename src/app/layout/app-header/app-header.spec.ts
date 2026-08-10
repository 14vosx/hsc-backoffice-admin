import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthSessionStore } from '../../core/auth/auth-session.store';
import { AppHeader } from './app-header';

@Component({
  template: '<app-header [isDrawerOpen]="isOpen" (toggleDrawer)="onToggle()" />',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AppHeader],
})
class TestHostComponent {
  isOpen = false;
  toggled = false;

  onToggle(): void {
    this.toggled = true;
  }
}

describe('AppHeader', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, AppHeader],
      providers: [
        provideRouter([]),
        {
          provide: AuthSessionStore,
          useValue: {
            status: signal('authenticated'),
            role: signal('admin'),
            user: signal({ name: 'Admin User' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should render administrative session information', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('status: authenticated');
    expect(text).toContain('role: admin');
    expect(text).toContain('Admin User');
  });

  it('should keep aria-expanded and its accessible label coherent', () => {
    const button = fixture.nativeElement.querySelector('.app-header__toggle') as HTMLButtonElement;
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Abrir menu de navegação');

    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Fechar menu de navegação');
  });

  it('should emit toggleDrawer when the menu button is clicked', () => {
    const button = fixture.nativeElement.querySelector('.app-header__toggle') as HTMLButtonElement;
    button.click();
    expect(fixture.componentInstance.toggled).toBe(true);
  });
});
