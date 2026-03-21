import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthSessionStore } from '../../../../core/auth/auth-session.store';

@Component({
  selector: 'hsc-auth-callback-page',
  standalone: true,
  templateUrl: './auth-callback-page.component.html',
  styleUrl: './auth-callback-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCallbackPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authSessionStore = inject(AuthSessionStore);

  protected readonly isResolving = signal(true);
  protected readonly message = signal('Validando acesso...');
  protected readonly error = signal<string | null>(null);

  constructor() {
    void this.handleCallback();
  }

  private async handleCallback(): Promise<void> {
    const status = this.route.snapshot.queryParamMap.get('status');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error) {
      this.error.set(this.mapError(error));
      this.message.set('Não foi possível concluir o acesso.');
      this.isResolving.set(false);
      return;
    }

    if (status !== 'ok') {
      this.error.set('Resposta de autenticação inválida.');
      this.message.set('Não foi possível concluir o acesso.');
      this.isResolving.set(false);
      return;
    }

    const authenticated = await this.resolveSessionWithRetry();

    if (authenticated) {
      await this.router.navigateByUrl('/dashboard');
      return;
    }

    this.error.set('A sessão não pôde ser validada.');
    this.message.set('Não foi possível concluir o acesso.');
    this.isResolving.set(false);
  }

  private async resolveSessionWithRetry(): Promise<boolean> {
    const delays = [0, 250, 600];

    for (const delayMs of delays) {
      if (delayMs > 0) {
        await this.sleep(delayMs);
      }

      try {
        await this.authSessionStore.reloadSession();

        if (this.authSessionStore.isAuthenticated()) {
          return true;
        }
      } catch {
        // tenta de novo nas próximas iterações
      }
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected async goToLogin(): Promise<void> {
    await this.router.navigateByUrl('/login');
  }

  private mapError(code: string): string {
    switch (code) {
      case 'db_not_ready':
        return 'O backend não está pronto no momento.';
      case 'missing_token':
        return 'O link de acesso está incompleto.';
      case 'invalid_or_expired_link':
        return 'O link é inválido, expirou ou já foi utilizado.';
      case 'forbidden':
        return 'Esta conta não tem permissão para acessar o Backoffice.';
      case 'consume_failed':
        return 'O backend falhou ao consumir o link de acesso.';
      default:
        return `Erro de autenticação: ${code}`;
    }
  }
}