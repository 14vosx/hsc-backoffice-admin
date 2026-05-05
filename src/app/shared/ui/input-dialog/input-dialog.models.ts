export interface InputDialogData {
  title: string;
  label: string;
  initialValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  inputType?: 'text' | 'email';
  required?: boolean;
  hint?: string;
}

export type InputDialogResult = string | null;
