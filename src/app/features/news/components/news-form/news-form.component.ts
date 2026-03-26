import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  AdminNewsEditableDraft,
  NewsFormValue,
} from '../../data-access/news-admin.models';
import { toNewsFormValue } from '../../utils/news-form.mapper';

export type NewsFormMode = 'create' | 'edit';

@Component({
  selector: 'hsc-news-form',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './news-form.component.html',
  styleUrl: './news-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() mode: NewsFormMode = 'create';
  @Input() initialValue: NewsFormValue | null = null;
  @Input() submitting = false;
  @Input() errorMessage: string | null = null;
  @Input() metadata: AdminNewsEditableDraft | null = null;

  @Output() formSubmit = new EventEmitter<NewsFormValue>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group({
    slug: ['', [Validators.required]],
    title: ['', [Validators.required]],
    content: ['', [Validators.required]],
  });

  ngOnChanges(_changes: SimpleChanges): void {
    this.syncFormState();
  }

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }

  get submitLabel(): string {
    return this.isEditMode ? 'Salvar alterações' : 'Criar draft';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.form.getRawValue());
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private syncFormState(): void {
    const value = toNewsFormValue(this.initialValue);

    this.form.reset(value, { emitEvent: false });

    if (this.isEditMode) {
      this.form.controls.slug.disable({ emitEvent: false });
    } else {
      this.form.controls.slug.enable({ emitEvent: false });
    }
  }
}
