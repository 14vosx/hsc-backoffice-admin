import { Injectable, computed, signal } from '@angular/core';

import { ConfirmationDialogData } from './confirmation-dialog.models';

interface ConfirmationQueueEntry {
  readonly data: ConfirmationDialogData;
  readonly resolve: (result: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private readonly activeEntry = signal<ConfirmationQueueEntry | null>(null);
  private readonly queue: ConfirmationQueueEntry[] = [];

  readonly activeRequest = computed(() => this.activeEntry()?.data ?? null);

  confirm(data: ConfirmationDialogData): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.queue.push({ data, resolve });
      this.showNext();
    });
  }

  resolve(result: boolean): void {
    const entry = this.activeEntry();
    if (!entry) {
      return;
    }

    this.activeEntry.set(null);
    entry.resolve(result);
    this.showNext();
  }

  private showNext(): void {
    if (this.activeEntry()) {
      return;
    }

    this.activeEntry.set(this.queue.shift() ?? null);
  }
}
