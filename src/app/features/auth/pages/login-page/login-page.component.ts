import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  protected readonly authSessionStore = inject(AuthSessionStore);

  protected readonly isBootstrapping = signal(false);
  protected readonly isResolving = signal(false);

  protected async handleBootstrapDevSession(): Promise<void> {
    this.isBootstrapping.set(true);

    try {
      await this.authSessionStore.bootstrapDevSession();
      await this.router.navigateByUrl('/dashboard');
    } finally {
      this.isBootstrapping.set(false);
    }
  }

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
}