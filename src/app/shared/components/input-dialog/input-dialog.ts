import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  effect,
  inject,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { InputDialogData } from '../../state/input-dialog.models';
import { InputDialogService } from '../../state/input-dialog.service';

@Component({
  selector: 'app-input-dialog',
  imports: [ReactiveFormsModule, CdkTrapFocus],
  templateUrl: './input-dialog.html',
  styleUrl: './input-dialog.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class InputDialog {
  protected readonly inputDialog = inject(InputDialogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly control = new FormControl('', { nonNullable: true });

  private previousActiveElement: HTMLElement | null = null;
  private previousBodyOverflow = '';
  private isOpen = false;
  private currentRequest: InputDialogData | null = null;

  constructor() {
    effect(() => {
      const request = this.inputDialog.activeRequest();

      if (request) {
        if (request !== this.currentRequest) {
          this.currentRequest = request;
          this.control.setValue(request.initialValue ?? '');
          this.control.setErrors(null);
          this.control.markAsUntouched();
        }
        this.openModal();
      } else {
        this.currentRequest = null;
        this.closeModal();
      }
    });

    this.destroyRef.onDestroy(() => this.closeModal(false));
  }

  @HostListener('window:keydown.escape')
  protected onEscape(): void {
    if (this.inputDialog.activeRequest()) {
      this.cancel();
    }
  }

  protected cancel(): void {
    this.inputDialog.resolve(null);
  }

  protected confirm(): void {
    const request = this.inputDialog.activeRequest();
    if (!request) {
      return;
    }

    const value = this.control.value.trim();
    if (request.required && !value) {
      this.control.setErrors({ required: true });
      this.control.markAsTouched();
      return;
    }

    this.inputDialog.resolve(value);
  }

  protected describedBy(request: InputDialogData): string | null {
    const ids: string[] = [];
    if (request.hint) {
      ids.push('input-dialog-hint');
    }
    if (this.control.hasError('required')) {
      ids.push('input-dialog-error');
    }
    return ids.length > 0 ? ids.join(' ') : null;
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
