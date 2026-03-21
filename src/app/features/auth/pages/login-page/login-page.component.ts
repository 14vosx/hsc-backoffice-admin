import { ChangeDetectionStrategy, Component, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthApiService } from '../../../../core/auth/auth-api.service';
import { AuthSessionStore } from '../../../../core/auth/auth-session.store';

@Component({
  selector: 'hsc-login-page',
  standalone: true,
  imports: [],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);
  protected readonly authSessionStore = inject(AuthSessionStore);

  protected readonly email = signal('');
  protected readonly isRequestingLink = signal(false);
  protected readonly isResolving = signal(false);
  protected readonly requestMessage = signal<string | null>(null);
  protected readonly requestError = signal<string | null>(null);

  protected readonly trimmedEmail = computed(() => this.email().trim().toLowerCase());

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

  protected async handleRequestMagicLink(): Promise<void> {
    if (!this.trimmedEmail()) {
      this.requestError.set('Informe um email.');
      this.requestMessage.set(null);
      return;
    }

    this.isRequestingLink.set(true);
    this.requestError.set(null);
    this.requestMessage.set(null);

    try {
      const response = await firstValueFrom(
        this.authApi.requestMagicLink(this.trimmedEmail()),
      );
      this.requestMessage.set(
        response?.message || 'Se a conta estiver autorizada, um link de acesso foi enviado.',
      );
    } catch {
      this.requestError.set('Não foi possível solicitar o link neste momento.');
    } finally {
      this.isRequestingLink.set(false);
    }
  }

  protected updateEmail(value: string): void {
    this.email.set(value);
  }
}