import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthSessionStore } from '../../../../core/auth/auth-session.store';
import { UiCard } from '../../../../shared/components/card/card';
import { normalizeAdminEmail } from '../../admin-email-auth-validation';
import { AdminEmailAuthApiService } from '../../data-access/admin-email-auth-api.service';

@Component({
  selector: 'hsc-login-page',
  standalone: true,
  imports: [UiCard],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  private readonly emailAuthApi = inject(AdminEmailAuthApiService);
  protected readonly authSessionStore = inject(AuthSessionStore);

  protected readonly email = signal('');
  protected readonly pending = signal(false);
  protected readonly isResolving = signal(false);
  protected readonly requestMessage = signal<string | null>(null);
  protected readonly requestError = signal<string | null>(null);

  protected async handleResolveCurrentSession(): Promise<void> {
    this.isResolving.set(true);

    try {
      await this.authSessionStore.reloadSession();

      if (this.authSessionStore.isAuthenticated()) {
        await this.router.navigateByUrl('/dashboard');
      }
    } finally {
      this.isResolving.set(false);
    }
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (this.pending()) {
      return;
    }

    const email = normalizeAdminEmail(this.email());
    if (!email) {
      this.requestError.set('Informe um email.');
      this.requestMessage.set(null);
      return;
    }

    this.pending.set(true);
    this.requestError.set(null);
    this.requestMessage.set(null);

    this.emailAuthApi.requestMagicLink({ email }).subscribe({
      next: (result) => {
        this.pending.set(false);
        this.requestMessage.set(
          result.message || 'Se a conta estiver autorizada, um link de acesso foi enviado.',
        );
      },
      error: () => {
        this.pending.set(false);
        this.requestError.set('Não foi possível solicitar o link neste momento.');
      },
    });
  }

  protected updateEmail(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    if (this.requestError()) {
      this.requestError.set(null);
    }
  }
}
