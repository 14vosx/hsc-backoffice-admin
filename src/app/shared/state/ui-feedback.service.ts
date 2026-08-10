import { Injectable, computed, signal } from '@angular/core';

export type UiFeedbackTone = 'success' | 'error' | 'info';

export interface UiFeedbackMessage {
  readonly message: string;
  readonly tone: UiFeedbackTone;
  readonly duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class UiFeedbackService {
  private readonly activeEntry = signal<UiFeedbackMessage | null>(null);
  private readonly queue: UiFeedbackMessage[] = [];
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  readonly activeMessage = computed(() => this.activeEntry());

  success(message: string): void {
    this.enqueue(message, 'success', 4000);
  }

  error(message: string): void {
    this.enqueue(message, 'error', 6000);
  }

  info(message: string): void {
    this.enqueue(message, 'info', 4000);
  }

  dismiss(): void {
    if (!this.activeEntry()) {
      return;
    }

    this.clearDismissTimer();
    this.activeEntry.set(null);
    this.showNext();
  }

  private enqueue(message: string, tone: UiFeedbackTone, duration: number): void {
    this.queue.push({ message, tone, duration });
    this.showNext();
  }

  private showNext(): void {
    if (this.activeEntry()) {
      return;
    }

    const next = this.queue.shift() ?? null;
    this.activeEntry.set(next);

    if (next) {
      this.dismissTimer = setTimeout(() => this.dismiss(), next.duration);
    }
  }

  private clearDismissTimer(): void {
    if (this.dismissTimer !== null) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }
}
