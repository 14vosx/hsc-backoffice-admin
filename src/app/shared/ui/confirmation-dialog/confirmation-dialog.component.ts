import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { ConfirmationDialogData } from './confirmation-dialog.models';

@Component({
  selector: 'hsc-confirmation-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);

  readonly cancelLabel = this.data.cancelLabel ?? 'Cancelar';
  readonly confirmLabel = this.data.confirmLabel ?? 'Confirmar';
  readonly tone = this.data.tone ?? 'default';
}
