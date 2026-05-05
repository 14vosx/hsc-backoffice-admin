import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class UiFeedbackService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.open(message, 4000);
  }

  error(message: string): void {
    this.open(message, 6000);
  }

  info(message: string): void {
    this.open(message, 4000);
  }

  private open(message: string, duration: number): void {
    this.snackBar.open(message, 'Fechar', { duration });
  }
}
