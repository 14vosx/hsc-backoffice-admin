import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

import { PageContainerComponent } from '../../../../core/layout/page-container/page-container.component';
import { AuthSessionStore } from '../../../../core/auth/auth-session.store';
import { PageFeedbackComponent } from '../../../../shared/ui/page-feedback/page-feedback.component';
import { NewsAdminStore } from '../../../news/data-access/news-admin.store';
import { SeasonsAdminStore } from '../../../seasons/data-access/seasons-admin.store';

@Component({
  selector: 'hsc-dashboard-page',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    PageContainerComponent,
    PageFeedbackComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  protected readonly authSessionStore = inject(AuthSessionStore);
  protected readonly newsStore = inject(NewsAdminStore);
  protected readonly seasonsStore = inject(SeasonsAdminStore);

  protected readonly operatorName = computed(() => {
    const user = this.authSessionStore.user();

    return user?.name || user?.email || 'operador';
  });

  protected readonly activeOrLatestSeason = computed(() => {
    const items = this.seasonsStore.items();

    if (items.length === 0) {
      return null;
    }

    const active = items
      .filter((item) => this.normalizedStatus(item.status) === 'active')
      .sort((a, b) => this.timestamp(b.updated_at) - this.timestamp(a.updated_at))[0];

    return active ?? this.latestByUpdatedAt(items);
  });

  protected readonly featuredNews = computed(() => {
    const items = this.newsStore.items();

    if (items.length === 0) {
      return null;
    }

    const published = items
      .filter((item) => this.normalizedStatus(item.status) === 'published' && !!item.published_at)
      .sort((a, b) => this.timestamp(b.published_at) - this.timestamp(a.published_at))[0];

    return published ?? this.latestByUpdatedAt(items);
  });

  ngOnInit(): void {
    void this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    await Promise.all([
      this.newsStore.ensureLoaded().catch(() => undefined),
      this.seasonsStore.ensureLoaded().catch(() => undefined),
    ]);
  }

  private latestByUpdatedAt<T extends { updated_at: string }>(items: T[]): T | null {
    return [...items].sort((a, b) => this.timestamp(b.updated_at) - this.timestamp(a.updated_at))[0] ?? null;
  }

  private normalizedStatus(status: string): string {
    return String(status).toLowerCase();
  }

  private timestamp(value: string | null): number {
    return value ? new Date(value).getTime() || 0 : 0;
  }
}
