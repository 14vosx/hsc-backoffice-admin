import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { PageContainerComponent } from '../../../../core/layout/page-container/page-container.component';
import { AuthSessionStore } from '../../../../core/auth/auth-session.store';
import { PageFeedbackComponent } from '../../../../shared/ui/page-feedback/page-feedback.component';
import { NewsAdminStore } from '../../../news/data-access/news-admin.store';
import { SeasonsCompetitiveSummaryApiService } from '../../../seasons/data-access/seasons-competitive-summary-api.service';
import { SeasonsCompetitiveIndexResponse } from '../../../seasons/data-access/seasons-competitive-summary.models';
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
  private readonly competitiveSummaryApi = inject(SeasonsCompetitiveSummaryApiService);

  protected readonly competitiveIndex = signal<SeasonsCompetitiveIndexResponse | null>(null);
  protected readonly competitiveLoading = signal(false);
  protected readonly competitiveError = signal<string | null>(null);

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

  protected readonly activeOrLatestSeasonCompetitiveSummary = computed(() => {
    const season = this.activeOrLatestSeason();
    const competitiveIndex = this.competitiveIndex();

    if (!season || !competitiveIndex) {
      return null;
    }

    return competitiveIndex.seasons.find((item) => item.slug === season.slug)?.summary ?? null;
  });

  ngOnInit(): void {
    void this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    await Promise.all([
      this.newsStore.ensureLoaded().catch(() => undefined),
      this.seasonsStore.ensureLoaded().catch(() => undefined),
      this.loadCompetitiveIndex().catch(() => undefined),
    ]);
  }

  private async loadCompetitiveIndex(): Promise<void> {
    this.competitiveLoading.set(true);
    this.competitiveError.set(null);

    try {
      const response = await firstValueFrom(this.competitiveSummaryApi.index());
      this.competitiveIndex.set(response);
    } catch {
      this.competitiveIndex.set(null);
      this.competitiveError.set('Resumo competitivo indisponível agora.');
    } finally {
      this.competitiveLoading.set(false);
    }
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

  protected toUtcDateTime(value: string | null): string | null {
    return value ? `${value.replace(' ', 'T')}Z` : null;
  }
}
