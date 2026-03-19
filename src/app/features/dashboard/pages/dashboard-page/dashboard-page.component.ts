import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageContainerComponent } from '../../../../core/layout/page-container/page-container.component';
import { AuthSessionStore } from '../../../../core/auth/auth-session.store';

@Component({
  selector: 'hsc-dashboard-page',
  standalone: true,
  imports: [RouterLink, PageContainerComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly authSessionStore = inject(AuthSessionStore);

  protected readonly isRefreshing = signal(false);

  protected async handleRefreshSession(): Promise<void> {
    this.isRefreshing.set(true);

    try {
      await this.authSessionStore.reloadSession();
    } finally {
      this.isRefreshing.set(false);
    }
  }
}