import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  effect,
  inject,
} from '@angular/core';

import { ConfirmationService } from '../../state/confirmation.service';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [CdkTrapFocus],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ConfirmationDialog {
  protected readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  private previousActiveElement: HTMLElement | null = null;
  private previousBodyOverflow = '';
  private isOpen = false;

  constructor() {
    effect(() => {
      if (this.confirmation.activeRequest()) {
        this.openModal();
      } else {
        this.closeModal();
      }
    });

    this.destroyRef.onDestroy(() => this.closeModal(false));
  }

  @HostListener('window:keydown.escape')
  protected onEscape(): void {
    if (this.confirmation.activeRequest()) {
      this.cancel();
    }
  }

  protected confirm(): void {
    this.confirmation.resolve(true);
  }

  protected cancel(): void {
    this.confirmation.resolve(false);
  }

  protected stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  private openModal(): void {
    if (this.isOpen) {
      return;
    }

    if (typeof document !== 'undefined') {
      this.previousActiveElement = document.activeElement as HTMLElement | null;
      this.previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    this.isOpen = true;
  }

  private closeModal(restoreFocus = true): void {
    if (!this.isOpen) {
      return;
    }

    if (typeof document !== 'undefined') {
      document.body.style.overflow = this.previousBodyOverflow;
    }

    if (restoreFocus && this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
      this.previousActiveElement.focus();
    }

    this.previousActiveElement = null;
    this.isOpen = false;
  }
}
