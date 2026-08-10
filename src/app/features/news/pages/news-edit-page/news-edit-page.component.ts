import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PageContainerComponent } from '../../../../layout/page-container/page-container.component';
import { UiCard } from '../../../../shared/components/card/card';
import { InlineFeedback } from '../../../../shared/components/inline-feedback/inline-feedback';
import { ConfirmationService } from '../../../../shared/state/confirmation.service';
import { UiFeedbackService } from '../../../../shared/state/ui-feedback.service';
import { NewsFormComponent, type NewsFormCommand } from '../../components/news-form/news-form.component';
import { NewsAdminStore } from '../../state/news-admin.store';

type EditPageResolutionState = 'loading' | 'ready' | 'invalid-id' | 'not-found' | 'error';

@Component({
  selector: 'hsc-news-edit-page',
  standalone: true,
  imports: [
    DatePipe,
    PageContainerComponent,
    NewsFormComponent,
    UiCard,
    InlineFeedback,
  ],
  templateUrl: './news-edit-page.component.html',
  styleUrl: './news-edit-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsEditPageComponent implements OnInit {
  private readonly confirmation = inject(ConfirmationService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(NewsAdminStore);

  readonly newsId = signal<number | null>(null);
  readonly resolutionState = signal<EditPageResolutionState>('loading');
  readonly resolutionMessage = signal<string | null>(null);

  readonly item = computed(() => {
    const id = this.newsId();
    return id === null ? null : this.store.itemById(id);
  });

  readonly initialValue = this.store.selectedItem;
  readonly metadata = this.store.selectedItem;

  readonly pageError = computed(() => this.resolutionMessage() ?? this.store.error());
  readonly submitting = computed(() => {
    const active = this.store.activeMutation();
    return active === 'update' || active === 'publish' || active === 'unpublish' || active === 'remove';
  });

  readonly canRenderForm = computed(
    () => this.resolutionState() === 'ready' && this.initialValue() !== null,
  );

  readonly canRunLifecycle = computed(
    () => this.item() !== null && this.resolutionState() !== 'loading' && !this.submitting(),
  );

  readonly isPublished = computed(
    () => this.item()?.status === 'published',
  );

  ngOnInit(): void {
    void this.initialize();
  }

  async retry(): Promise<void> {
    await this.resolveContext();
  }

  async submit(command: NewsFormCommand): Promise<void> {
    const id = this.newsId();

    if (id === null || 'slug' in command) {
      return;
    }

    try {
      await this.store.update(id, command);
      this.resolutionState.set('ready');
      this.resolutionMessage.set(null);
    } catch {
      // erro já refletido na store
    }
  }

  async publish(): Promise<void> {
    const id = this.newsId();

    if (id === null) {
      return;
    }

    const confirmed = await this.confirmation.confirm({
      title: 'Publicar news',
      message: 'Publicar esta news no portal?',
      confirmLabel: 'Publicar',
      cancelLabel: 'Cancelar',
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.store.publish(id);
      this.feedback.success('News publicada com sucesso.');
    } catch {
      this.feedback.error(this.store.error() ?? 'Falha ao publicar news.');
    }
  }

  async unpublish(): Promise<void> {
    const id = this.newsId();

    if (id === null) {
      return;
    }

    const confirmed = await this.confirmation.confirm({
      title: 'Despublicar news',
      message: 'Despublicar esta news do portal?',
      confirmLabel: 'Despublicar',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.store.unpublish(id);
      this.feedback.success('News despublicada com sucesso.');
    } catch {
      this.feedback.error(this.store.error() ?? 'Falha ao despublicar news.');
    }
  }

  async remove(): Promise<void> {
    const id = this.newsId();

    if (id === null) {
      return;
    }

    const confirmed = await this.confirmation.confirm({
      title: 'Remover news',
      message: 'Deseja remover esta news? Esta ação não pode ser desfeita.',
      confirmLabel: 'Remover',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.store.remove(id);
      this.feedback.success('News removida com sucesso.');
      await this.router.navigate(['/news']);
    } catch {
      this.feedback.error(this.store.error() ?? 'Falha ao remover news.');
    }
  }

  async cancel(): Promise<void> {
    await this.router.navigate(['/news']);
  }

  private async initialize(): Promise<void> {
    this.store.resetError();

    const rawId = this.route.snapshot.paramMap.get('id');
    const id = Number(rawId);

    if (!rawId || Number.isNaN(id) || id <= 0) {
      this.newsId.set(null);
      this.resolutionState.set('invalid-id');
      this.resolutionMessage.set('Identificador de news inválido.');
      return;
    }

    this.newsId.set(id);

    await this.resolveContext();
  }

  private async resolveContext(): Promise<void> {
    this.resolutionState.set('loading');
    this.resolutionMessage.set(null);
    this.store.resetError();

    const id = this.newsId();

    if (id === null) {
      this.resolutionState.set('invalid-id');
      this.resolutionMessage.set('Identificador de news inválido.');
      return;
    }

    try {
      await this.store.loadDetail(id);

      this.resolutionState.set('ready');
      this.resolutionMessage.set(null);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        this.resolutionState.set('not-found');
        this.resolutionMessage.set('A news solicitada não foi encontrada.');
        return;
      }

      if (!this.store.error()) {
        this.resolutionMessage.set('Falha ao preparar a edição da news.');
      }

      this.resolutionState.set('error');
    }
  }
}
