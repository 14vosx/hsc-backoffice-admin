import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { NewsAdminApiService } from '../data-access/news-admin-api.service';
import type { AdminNews, AdminNewsCreateResult, AdminNewsDetail, CreateAdminNewsCommand, UpdateAdminNewsCommand } from '../domain/admin-news.model';
import { mapNewsErrorMessage } from '../utils/news-error.mapper';

export type NewsAdminMutationKind = 'create' | 'update' | 'publish' | 'unpublish' | 'remove';

@Injectable({ providedIn: 'root' })
export class NewsAdminStore {
  private readonly api = inject(NewsAdminApiService);

  readonly items = signal<AdminNews[]>([]);
  readonly selectedItem = signal<AdminNewsDetail | null>(null);
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);
  readonly activeMutation = signal<NewsAdminMutationKind | null>(null);
  readonly count = computed(() => this.items().length);
  readonly isEmpty = computed(() => this.loaded() && !this.loading() && this.count() === 0);

  resetError(): void { this.error.set(null); }
  itemById(id: number): AdminNews | null { return this.items().find((item) => item.id === id) ?? null; }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.items.set(await firstValueFrom(this.api.list()));
      this.loaded.set(true);
    } catch (error) {
      this.error.set(mapNewsErrorMessage(error));
      throw error;
    } finally { this.loading.set(false); }
  }

  async refresh(): Promise<void> { await this.load(); }
  async ensureLoaded(): Promise<void> { if (!this.loaded() && !this.loading()) await this.load(); }

  async loadDetail(id: number): Promise<AdminNewsDetail> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const detail = await firstValueFrom(this.api.get(id));
      this.selectedItem.set(detail);
      this.upsertLocal(detail);
      return detail;
    } catch (error) {
      this.selectedItem.set(null);
      this.error.set(mapNewsErrorMessage(error));
      throw error;
    } finally { this.loading.set(false); }
  }

  create(command: CreateAdminNewsCommand): Promise<AdminNewsCreateResult> {
    return this.runMutation('create', async () => {
      const result = await firstValueFrom(this.api.create(command));
      try { await this.refresh(); } catch { /* criação concluída; a listagem poderá ser recarregada depois */ }
      return result;
    });
  }

  update(id: number, command: UpdateAdminNewsCommand): Promise<AdminNews> {
    return this.runMutation('update', async () => {
      const item = await firstValueFrom(this.api.update(id, command));
      this.upsertLocal(item);
      const selected = this.selectedItem();
      if (selected?.id === id) this.selectedItem.set({ ...selected, ...item, content: command.content });
      return item;
    });
  }

  publish(id: number): Promise<AdminNews> { return this.lifecycle('publish', id); }
  unpublish(id: number): Promise<AdminNews> { return this.lifecycle('unpublish', id); }

  async remove(id: number): Promise<void> {
    await this.runMutation('remove', async () => {
      await firstValueFrom(this.api.remove(id));
      this.items.set(this.items().filter((item) => item.id !== id));
      if (this.selectedItem()?.id === id) this.selectedItem.set(null);
    });
  }

  private lifecycle(kind: 'publish' | 'unpublish', id: number): Promise<AdminNews> {
    return this.runMutation(kind, async () => {
      const item = await firstValueFrom(kind === 'publish' ? this.api.publish(id) : this.api.unpublish(id));
      this.upsertLocal(item);
      const selected = this.selectedItem();
      if (selected?.id === id) this.selectedItem.set({ ...selected, ...item });
      return item;
    });
  }

  private async runMutation<T>(kind: NewsAdminMutationKind, operation: () => Promise<T>): Promise<T> {
    this.activeMutation.set(kind);
    this.error.set(null);
    try { return await operation(); }
    catch (error) { this.error.set(mapNewsErrorMessage(error)); throw error; }
    finally { this.activeMutation.set(null); }
  }

  private upsertLocal(item: AdminNews): void {
    const index = this.items().findIndex((entry) => entry.id === item.id);
    if (index < 0) { this.items.update((items) => [item, ...items]); return; }
    this.items.update((items) => items.map((entry) => entry.id === item.id ? item : entry));
  }
}
