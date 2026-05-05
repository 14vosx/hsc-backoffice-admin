import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { InputDialogComponent } from './input-dialog.component';
import { InputDialogData, InputDialogResult } from './input-dialog.models';

@Injectable({
  providedIn: 'root',
})
export class InputDialogService {
  private readonly dialog = inject(MatDialog);

  async prompt(data: InputDialogData): Promise<InputDialogResult> {
    const dialogRef = this.dialog.open<
      InputDialogComponent,
      InputDialogData,
      InputDialogResult | undefined
    >(InputDialogComponent, { data });
    const result = await firstValueFrom(dialogRef.afterClosed());

    return typeof result === 'string' ? result : null;
  }
}
