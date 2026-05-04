import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { toCreateSeasonPayload, toUpdateSeasonPayload } from '../utils/seasons-form.mapper';
import { mapSeasonsErrorMessage } from '../utils/seasons-error.mapper';
import { SeasonsAdminApiService } from './seasons-admin-api.service';
import {
  AdminSeasonLifecycleResponse,
  AdminSeasonUpdateResponse,
  AdminSeasonListItem,
  CreateSeasonResponse,
  SeasonFormValue,
} from './seasons-admin.models';

export type SeasonsAdminMutationKind = 'create' | 'update' | 'activate' | 'close';

@Injectable({
  providedIn: 'root',
})
export class SeasonsAdminStore {
  private readonly api = inject(SeasonsAdminApiService);

  readonly items = signal<AdminSeasonListItem[]>([]);
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);
  readonly activeMutation = signal<SeasonsAdminMutationKind | null>(null);
  readonly selectedItem = signal<AdminSeasonListItem | null>(null);

  readonly count = computed(() => this.items().length);
  readonly isEmpty = computed(() => this.loaded() && !this.loading() && this.count() === 0);

  resetError(): void {
    this.error.set(null);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.api.list());

      this.items.set(response.items);
      this.loaded.set(true);
    } catch (error) {
      this.error.set(mapSeasonsErrorMessage(error));
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

  async loadDetail(slug: string): Promise<AdminSeasonListItem> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const item = await firstValueFrom(this.api.get(slug));

      this.selectedItem.set(item);
      return item;
    } catch (error) {
      this.selectedItem.set(null);
      this.error.set(mapSeasonsErrorMessage(error));
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  async create(value: SeasonFormValue): Promise<CreateSeasonResponse> {
    return this.runMutation('create', async () => {
      const payload = toCreateSeasonPayload(value);
      const response = await firstValueFrom(this.api.create(payload));

      try {
        await this.refresh();
      } catch {
        // criação já concluída; a listagem pode ser recarregada depois
      }

      return response;
    });
  }

  async update(slug: string, value: SeasonFormValue): Promise<AdminSeasonUpdateResponse> {
    return this.runMutation('update', async () => {
      const payload = toUpdateSeasonPayload(value);
      const response = await firstValueFrom(this.api.update(slug, payload));

      try {
        await this.refresh();
      } catch {
        // alteração já concluída; a listagem pode ser recarregada depois
      }

      return response;
    });
  }

  async activate(slug: string): Promise<AdminSeasonLifecycleResponse> {
    return this.runMutation('activate', async () => {
      const response = await firstValueFrom(this.api.activate(slug));

      try {
        await this.refresh();
      } catch {
        // ativação já concluída; a listagem pode ser recarregada depois
      }

      return response;
    });
  }

  async close(slug: string): Promise<AdminSeasonLifecycleResponse> {
    return this.runMutation('close', async () => {
      const response = await firstValueFrom(this.api.close(slug));

      try {
        await this.refresh();
      } catch {
        // fechamento já concluído; a listagem pode ser recarregada depois
      }

      return response;
    });
  }

  private async runMutation<T>(
    kind: SeasonsAdminMutationKind,
    operation: () => Promise<T>,
  ): Promise<T> {
    this.activeMutation.set(kind);
    this.error.set(null);

    try {
      return await operation();
    } catch (error) {
      this.error.set(mapSeasonsErrorMessage(error));
      throw error;
    } finally {
      this.activeMutation.set(null);
    }
  }
}
