export type ConfirmationDialogTone = 'default' | 'danger';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmationDialogTone;
}
