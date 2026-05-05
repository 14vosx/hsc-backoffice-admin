import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { InputDialogData, InputDialogResult } from './input-dialog.models';

@Component({
  selector: 'hsc-input-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './input-dialog.component.html',
  styleUrl: './input-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<InputDialogComponent, InputDialogResult>>(
    MatDialogRef,
  );

  readonly data = inject<InputDialogData>(MAT_DIALOG_DATA);
  readonly control = new FormControl(this.data.initialValue ?? '', { nonNullable: true });

  readonly cancelLabel = this.data.cancelLabel ?? 'Cancelar';
  readonly confirmLabel = this.data.confirmLabel ?? 'Confirmar';
  readonly inputType = this.data.inputType ?? 'text';

  cancel(): void {
    this.dialogRef.close(null);
  }

  confirm(): void {
    const value = this.control.value.trim();

    if (this.data.required && !value) {
      this.control.setErrors({ required: true });
      this.control.markAsTouched();
      return;
    }

    this.dialogRef.close(value);
  }
}
