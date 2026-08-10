import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthSessionStore } from '../../../../core/auth/auth-session.store';
import { AdminEmailAuthApiService } from '../../data-access/admin-email-auth-api.service';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  const api = { requestMagicLink: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    api.requestMagicLink.mockReturnValue(of({ message: 'Link enviado.' }));
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        { provide: AdminEmailAuthApiService, useValue: api },
        {
          provide: AuthSessionStore,
          useValue: {
            status: signal('unauthenticated'),
            role: signal(null),
            user: signal(null),
            error: signal(null),
            isAuthenticated: signal(false),
            reloadSession: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
  });

  it('should submit a normalized email and show success', () => {
    setEmail('  ADMIN@HSC.GG  ');
    submit();

    expect(api.requestMagicLink).toHaveBeenCalledWith({ email: 'admin@hsc.gg' });
    expect(fixture.nativeElement.textContent).toContain('Link enviado.');
  });

  it('should disable controls and ignore duplicate submit while pending', () => {
    api.requestMagicLink.mockReturnValue(new Subject());
    setEmail('admin@hsc.gg');
    submit();

    const input = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    const button = fixture.nativeElement.querySelector('.login-page__action--primary') as HTMLButtonElement;
    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);

    submit();
    expect(api.requestMagicLink).toHaveBeenCalledTimes(1);
  });

  it('should reject an empty email without calling data-access', () => {
    submit();

    expect(api.requestMagicLink).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('#login-email-error').textContent).toContain('Informe um email.');
  });

  it('should expose a safe error and finish pending', () => {
    api.requestMagicLink.mockReturnValue(throwError(() => new Error('transport detail')));
    setEmail('admin@hsc.gg');
    submit();

    const button = fixture.nativeElement.querySelector('.login-page__action--primary') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Não foi possível solicitar o link neste momento.');
    expect(fixture.nativeElement.textContent).not.toContain('transport detail');
  });

  function setEmail(value: string): void {
    const input = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function submit(): void {
    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', new Event('submit'));
    fixture.detectChanges();
  }
});
