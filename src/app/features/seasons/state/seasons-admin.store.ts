import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { SeasonsAdminApiService } from '../data-access/seasons-admin-api.service';
import type {
  AdminSeason,
  AdminSeasonCreateResult,
  AdminSeasonLifecycleResult,
  AdminSeasonUpdateResult,
  CreateAdminSeasonCommand,
  UpdateAdminSeasonCommand,
} from '../domain/admin-season.model';
import { mapSeasonsErrorMessage } from '../utils/seasons-error.mapper';

export type SeasonsAdminMutationKind = 'create' | 'update' | 'activate' | 'close';

@Injectable({ providedIn: 'root' })
export class SeasonsAdminStore {
  private readonly api = inject(SeasonsAdminApiService);

  readonly items = signal<AdminSeason[]>([]);
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);
  readonly activeMutation = signal<SeasonsAdminMutationKind | null>(null);
  readonly selectedItem = signal<AdminSeason | null>(null);
  readonly count = computed(() => this.items().length);
  readonly isEmpty = computed(() => this.loaded() && !this.loading() && this.count() === 0);

  resetError(): void {
    this.error.set(null);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.items.set(await firstValueFrom(this.api.list()));
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
    if (!this.loaded() && !this.loading()) await this.load();
  }

  async loadDetail(slug: string): Promise<AdminSeason> {
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

  create(command: CreateAdminSeasonCommand): Promise<AdminSeasonCreateResult> {
    return this.runMutation('create', () => firstValueFrom(this.api.create(command)));
  }

  update(slug: string, command: UpdateAdminSeasonCommand): Promise<AdminSeasonUpdateResult> {
    return this.runMutation('update', () => firstValueFrom(this.api.update(slug, command)));
  }

  activate(slug: string): Promise<AdminSeasonLifecycleResult> {
    return this.runMutation('activate', () => firstValueFrom(this.api.activate(slug)));
  }

  close(slug: string): Promise<AdminSeasonLifecycleResult> {
    return this.runMutation('close', () => firstValueFrom(this.api.close(slug)));
  }

  private async runMutation<T>(kind: SeasonsAdminMutationKind, operation: () => Promise<T>): Promise<T> {
    this.activeMutation.set(kind);
    this.error.set(null);
    try {
      const result = await operation();
      try {
        await this.refresh();
      } catch {
        // A mutação foi concluída; a listagem poderá ser recarregada depois.
      }
      return result;
    } catch (error) {
      this.error.set(mapSeasonsErrorMessage(error));
      throw error;
    } finally {
      this.activeMutation.set(null);
    }
  }
}
