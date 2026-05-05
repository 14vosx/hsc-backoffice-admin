import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { ConfirmationDialogData } from './confirmation-dialog.models';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private readonly dialog = inject(MatDialog);

  async confirm(data: ConfirmationDialogData): Promise<boolean> {
    const dialogRef = this.dialog.open<
      ConfirmationDialogComponent,
      ConfirmationDialogData,
      boolean | null | undefined
    >(ConfirmationDialogComponent, { data });
    const result = await firstValueFrom(dialogRef.afterClosed());

    return result === true;
  }
}
