import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { mapSeasonsErrorMessage } from '../utils/seasons-error.mapper';
import { SeasonsAdminApiService } from './seasons-admin-api.service';
import { AdminSeasonListItem } from './seasons-admin.models';

@Injectable({
  providedIn: 'root',
})
export class SeasonsAdminStore {
  private readonly api = inject(SeasonsAdminApiService);

  readonly items = signal<AdminSeasonListItem[]>([]);
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);

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
}
