import { Injectable, computed, signal } from '@angular/core';

import { InputDialogData, InputDialogResult } from './input-dialog.models';

interface InputDialogQueueEntry {
  readonly data: InputDialogData;
  readonly resolve: (result: InputDialogResult) => void;
}

@Injectable({
  providedIn: 'root',
})
export class InputDialogService {
  private readonly activeEntry = signal<InputDialogQueueEntry | null>(null);
  private readonly queue: InputDialogQueueEntry[] = [];

  readonly activeRequest = computed(() => this.activeEntry()?.data ?? null);

  prompt(data: InputDialogData): Promise<InputDialogResult> {
    return new Promise<InputDialogResult>((resolve) => {
      this.queue.push({ data, resolve });
      this.showNext();
    });
  }

  resolve(result: InputDialogResult): void {
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
