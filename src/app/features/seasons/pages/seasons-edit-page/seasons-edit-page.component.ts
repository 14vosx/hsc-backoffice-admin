import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { PageContainerComponent } from '../../../../core/layout/page-container/page-container.component';
import { PageFeedbackComponent } from '../../../../shared/ui/page-feedback/page-feedback.component';
import { SeasonsFormComponent } from '../../components/seasons-form/seasons-form.component';
import { AdminSeasonListItem, SeasonFormValue } from '../../data-access/seasons-admin.models';
import { SeasonsAdminStore } from '../../data-access/seasons-admin.store';
import { SeasonsCompetitiveSummaryApiService } from '../../data-access/seasons-competitive-summary-api.service';
import { SeasonCompetitiveDetailResponse } from '../../data-access/seasons-competitive-summary.models';
import { seasonItemToFormValue } from '../../utils/seasons-form.mapper';

type EditPageResolutionState = 'loading' | 'ready' | 'invalid-slug' | 'not-found' | 'error';

@Component({
  selector: 'hsc-seasons-edit-page',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    PageContainerComponent,
    SeasonsFormComponent,
    PageFeedbackComponent,
  ],
  templateUrl: './seasons-edit-page.component.html',
  styleUrl: './seasons-edit-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsEditPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly competitiveSummaryApi = inject(SeasonsCompetitiveSummaryApiService);
  readonly store = inject(SeasonsAdminStore);

  readonly slug = signal<string | null>(null);
  readonly item = signal<AdminSeasonListItem | null>(null);
  readonly resolutionState = signal<EditPageResolutionState>('loading');
  readonly resolutionMessage = signal<string | null>(null);
  readonly competitiveDetail = signal<SeasonCompetitiveDetailResponse | null>(null);
  readonly competitiveLoading = signal(false);
  readonly competitiveError = signal<string | null>(null);

  readonly initialValue = computed(() => {
    const item = this.item();
    return item ? seasonItemToFormValue(item) : null;
  });

  readonly pageError = computed(() => this.resolutionMessage() ?? this.store.error());
  readonly submitting = computed(() => this.store.activeMutation() === 'update');
  readonly canRenderForm = computed(
    () => this.resolutionState() === 'ready' && this.initialValue() !== null,
  );

  ngOnInit(): void {
    void this.initialize();
  }

  async retry(): Promise<void> {
    await this.resolveContext();
  }

  async submit(value: SeasonFormValue): Promise<void> {
    const slug = this.slug();

    if (!slug) {
      return;
    }

    try {
      await this.store.update(slug, value);
      await this.router.navigate(['/seasons']);
    } catch {
      // erro já refletido na store
    }
  }

  async cancel(): Promise<void> {
    await this.router.navigate(['/seasons']);
  }

  private async initialize(): Promise<void> {
    this.store.resetError();

    const slug = (this.route.snapshot.paramMap.get('slug') ?? '').trim();

    if (!slug) {
      this.slug.set(null);
      this.resolutionState.set('invalid-slug');
      this.resolutionMessage.set('Slug de season inválido.');
      return;
    }

    this.slug.set(slug);

    await this.resolveContext();
  }

  private async resolveContext(): Promise<void> {
    this.resolutionState.set('loading');
    this.resolutionMessage.set(null);
    this.competitiveDetail.set(null);
    this.competitiveError.set(null);
    this.store.resetError();

    const slug = this.slug();

    if (!slug) {
      this.resolutionState.set('invalid-slug');
      this.resolutionMessage.set('Slug de season inválido.');
      return;
    }

    try {
      const item = await this.store.loadDetail(slug);

      this.item.set(item);
      this.resolutionState.set('ready');
      this.resolutionMessage.set(null);
      void this.loadCompetitiveSummary(slug);
    } catch (error) {
      this.item.set(null);

      if (error instanceof HttpErrorResponse && error.status === 404) {
        this.resolutionState.set('not-found');
        this.resolutionMessage.set('A season solicitada não foi encontrada.');
        return;
      }

      if (!this.store.error()) {
        this.resolutionMessage.set('Falha ao preparar a edição da season.');
      }

      this.resolutionState.set('error');
    }
  }

  private async loadCompetitiveSummary(slug: string): Promise<void> {
    this.competitiveDetail.set(null);
    this.competitiveError.set(null);
    this.competitiveLoading.set(true);

    try {
      const detail = await firstValueFrom(this.competitiveSummaryApi.detail(slug));
      this.competitiveDetail.set(detail);
    } catch {
      this.competitiveError.set('Resumo competitivo ainda não disponível para esta season.');
    } finally {
      this.competitiveLoading.set(false);
    }
  }

  protected toUtcDateTime(value: string | null): string | null {
    return value ? `${value.replace(' ', 'T')}Z` : null;
  }
}
