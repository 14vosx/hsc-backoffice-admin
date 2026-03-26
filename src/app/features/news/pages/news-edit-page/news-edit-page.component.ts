import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NewsFormComponent } from '../../components/news-form/news-form.component';
import { NewsAdminStore } from '../../data-access/news-admin.store';
import { AdminNewsEditableDraft, NewsFormValue } from '../../data-access/news-admin.models';
import { toNewsFormValue, toUpdateNewsPayload } from '../../utils/news-form.mapper';

type EditPageResolutionState = 'loading' | 'ready' | 'invalid-id' | 'not-found' | 'missing-draft';

@Component({
  selector: 'hsc-news-edit-page',
  standalone: true,
  imports: [DatePipe, NewsFormComponent],
  templateUrl: './news-edit-page.component.html',
  styleUrl: './news-edit-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsEditPageComponent implements OnInit {
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

  readonly editableDraft = computed(() => {
    const id = this.newsId();
    return id === null ? null : this.store.editableDraftById(id);
  });

  readonly metadata = computed<AdminNewsEditableDraft | null>(() => {
    const draft = this.editableDraft();

    if (draft) {
      return draft;
    }

    const item = this.item();

    if (!item) {
      return null;
    }

    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      content: '',
      status: item.status,
      published_at: item.published_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  });

  readonly initialValue = computed(() => {
    const draft = this.editableDraft();
    return draft ? toNewsFormValue(draft) : null;
  });

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
    () => (this.item()?.status ?? '').toLowerCase() === 'published',
  );

  ngOnInit(): void {
    void this.initialize();
  }

  async retry(): Promise<void> {
    await this.resolveContext();
  }

  async submit(value: NewsFormValue): Promise<void> {
    const id = this.newsId();

    if (id === null) {
      return;
    }

    try {
      await this.store.update(id, toUpdateNewsPayload(value), value);
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

    try {
      await this.store.publish(id);
    } catch {
      // erro já refletido na store
    }
  }

  async unpublish(): Promise<void> {
    const id = this.newsId();

    if (id === null) {
      return;
    }

    try {
      await this.store.unpublish(id);
    } catch {
      // erro já refletido na store
    }
  }

  async remove(): Promise<void> {
    const id = this.newsId();

    if (id === null) {
      return;
    }

    const confirmed = window.confirm('Deseja remover esta news?');

    if (!confirmed) {
      return;
    }

    try {
      await this.store.remove(id);
      await this.router.navigate(['/news']);
    } catch {
      // erro já refletido na store
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
      const item = await this.store.ensureItem(id);

      if (!item) {
        this.resolutionState.set('not-found');
        this.resolutionMessage.set(
          'A news solicitada não pôde ser resolvida localmente pela listagem administrativa.',
        );
        return;
      }

      const draft = this.store.editableDraftById(id);

      if (!draft) {
        this.resolutionState.set('missing-draft');
        this.resolutionMessage.set(
          'Este item foi localizado na listagem, mas o conteúdo editável não está disponível localmente neste checkpoint. Operações de lifecycle continuam disponíveis.',
        );
        return;
      }

      this.resolutionState.set('ready');
      this.resolutionMessage.set(null);
    } catch {
      if (!this.store.error()) {
        this.resolutionMessage.set('Falha ao preparar a edição da news.');
      }
    }
  }
}
