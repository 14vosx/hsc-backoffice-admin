import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  createEditableDraftFromCreate,
  mergeEditableDraftWithItem,
  toNewsFormValue,
} from '../utils/news-form.mapper';
import { mapNewsErrorMessage } from '../utils/news-error.mapper';
import { NewsAdminApiService } from './news-admin-api.service';
import {
  AdminNewsEditableDraft,
  AdminNewsListItem,
  CreateNewsResponse,
  NewsFormValue,
  UpdateNewsPayload,
} from './news-admin.models';

export type NewsAdminMutationKind = 'create' | 'update' | 'publish' | 'unpublish' | 'remove';

@Injectable({
  providedIn: 'root',
})
export class NewsAdminStore {
  private readonly api = inject(NewsAdminApiService);

  readonly items = signal<AdminNewsListItem[]>([]);
  readonly editableDrafts = signal<Record<number, AdminNewsEditableDraft>>({});
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);
  readonly activeMutation = signal<NewsAdminMutationKind | null>(null);

  readonly count = computed(() => this.items().length);
  readonly isEmpty = computed(() => this.loaded() && !this.loading() && this.count() === 0);

  resetError(): void {
    this.error.set(null);
  }

  itemById(id: number): AdminNewsListItem | null {
    return this.items().find((item) => item.id === id) ?? null;
  }

  editableDraftById(id: number): AdminNewsEditableDraft | null {
    return this.editableDrafts()[id] ?? null;
  }

  hasEditableDraft(id: number): boolean {
    return !!this.editableDraftById(id);
  }

  seedEditableDraft(draft: AdminNewsEditableDraft): void {
    this.editableDrafts.update((current) => ({
      ...current,
      [draft.id]: draft,
    }));
  }

  seedEditableDraftFromForm(id: number, value: NewsFormValue): AdminNewsEditableDraft | null {
    const item = this.itemById(id);

    if (!item) {
      return null;
    }

    const normalized = toNewsFormValue(value);
    const draft = mergeEditableDraftWithItem(
      {
        id,
        slug: normalized.slug || item.slug,
        title: normalized.title || item.title,
        content: normalized.content,
        status: item.status,
        published_at: item.published_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
      },
      item,
    );

    this.seedEditableDraft(draft);

    return draft;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.api.list());

      this.items.set(response.items);
      this.loaded.set(true);
      this.reconcileAllEditableDrafts();
    } catch (error) {
      this.error.set(mapNewsErrorMessage(error));
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  async refresh(): Promise<void> {
    await this.load();
  }

  async ensureLoaded(): Promise<void> {
    if (this.loaded() || this.loading()) {
      return;
    }

    await this.load();
  }

  async ensureItem(id: number): Promise<AdminNewsListItem | null> {
    await this.ensureLoaded();
    return this.itemById(id);
  }

  async create(value: NewsFormValue): Promise<CreateNewsResponse> {
    return this.runMutation('create', async () => {
      const normalized = toNewsFormValue(value);
      const response = await firstValueFrom(this.api.create(normalized));

      this.seedEditableDraft(createEditableDraftFromCreate(response.id, normalized));

      try {
        await this.refresh();
      } catch {
        // criação já concluída; o draft editável local continua disponível
      }

      return response;
    });
  }

  async update(id: number, payload: UpdateNewsPayload, formValue?: NewsFormValue): Promise<AdminNewsListItem> {
    return this.runMutation('update', async () => {
      const response = await firstValueFrom(this.api.update(id, payload));

      this.upsertLocal(response.item);

      if (formValue) {
        const existingDraft = this.editableDraftById(id);
        const normalized = toNewsFormValue(formValue);

        this.seedEditableDraft(
          mergeEditableDraftWithItem(
            {
              id,
              slug: existingDraft?.slug ?? response.item.slug,
              title: normalized.title || response.item.title,
              content: normalized.content,
              status: existingDraft?.status ?? response.item.status,
              published_at: existingDraft?.published_at ?? response.item.published_at,
              created_at: existingDraft?.created_at ?? response.item.created_at,
              updated_at: existingDraft?.updated_at ?? response.item.updated_at,
            },
            response.item,
          ),
        );
      } else {
        this.reconcileEditableDraft(response.item);
      }

      return response.item;
    });
  }

  async publish(id: number): Promise<AdminNewsListItem> {
    return this.runMutation('publish', async () => {
      const response = await firstValueFrom(this.api.publish(id));

      this.upsertLocal(response.item);
      this.reconcileEditableDraft(response.item);

      return response.item;
    });
  }

  async unpublish(id: number): Promise<AdminNewsListItem> {
    return this.runMutation('unpublish', async () => {
      const response = await firstValueFrom(this.api.unpublish(id));

      this.upsertLocal(response.item);
      this.reconcileEditableDraft(response.item);

      return response.item;
    });
  }

  async remove(id: number): Promise<void> {
    await this.runMutation('remove', async () => {
      await firstValueFrom(this.api.remove(id));
      this.removeLocal(id);
      this.removeEditableDraft(id);
    });
  }

  private async runMutation<T>(
    kind: NewsAdminMutationKind,
    operation: () => Promise<T>,
  ): Promise<T> {
    this.activeMutation.set(kind);
    this.error.set(null);

    try {
      return await operation();
    } catch (error) {
      this.error.set(mapNewsErrorMessage(error));
      throw error;
    } finally {
      this.activeMutation.set(null);
    }
  }

  private upsertLocal(item: AdminNewsListItem): void {
    const current = this.items();
    const index = current.findIndex((entry) => entry.id === item.id);

    if (index === -1) {
      this.items.set([item, ...current]);
      return;
    }

    const next = [...current];
    next[index] = item;

    this.items.set(next);
  }

  private removeLocal(id: number): void {
    this.items.set(this.items().filter((item) => item.id !== id));
  }

  private removeEditableDraft(id: number): void {
    this.editableDrafts.update((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  private reconcileEditableDraft(item: AdminNewsListItem): void {
    const existing = this.editableDraftById(item.id);

    if (!existing) {
      return;
    }

    this.seedEditableDraft(mergeEditableDraftWithItem(existing, item));
  }

  private reconcileAllEditableDrafts(): void {
    for (const item of this.items()) {
      this.reconcileEditableDraft(item);
    }
  }
}
