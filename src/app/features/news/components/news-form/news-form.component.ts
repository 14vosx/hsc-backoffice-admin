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
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';

import { PageFeedbackComponent } from '../../../../shared/ui/page-feedback/page-feedback.component';
import {
  AdminNewsEditableDraft,
  NewsFormValue,
} from '../../data-access/news-admin.models';
import { NewsImageUploadApiService } from '../../data-access/news-image-upload-api.service';
import { toNewsFormValue } from '../../utils/news-form.mapper';

export type NewsFormMode = 'create' | 'edit';

@Component({
  selector: 'hsc-news-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PageFeedbackComponent,
  ],
  templateUrl: './news-form.component.html',
  styleUrl: './news-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly imageUploadApi = inject(NewsImageUploadApiService);
  private readonly acceptedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

  @Input() mode: NewsFormMode = 'create';
  @Input() initialValue: NewsFormValue | null = null;
  @Input() submitting = false;
  @Input() errorMessage: string | null = null;
  @Input() metadata: AdminNewsEditableDraft | null = null;

  @Output() formSubmit = new EventEmitter<NewsFormValue>();
  @Output() cancel = new EventEmitter<void>();

  readonly uploadingImage = signal(false);
  readonly uploadErrorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    slug: this.fb.nonNullable.control('', [Validators.required]),
    title: this.fb.nonNullable.control('', [Validators.required]),
    content: this.fb.nonNullable.control('', [Validators.required]),
    image_url: this.fb.control<string | null>(null),
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

  get imageUrl(): string | null {
    return this.form.controls.image_url.value;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(toNewsFormValue(this.form.getRawValue()));
  }

  onCancel(): void {
    this.cancel.emit();
  }

  async onImageFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!this.acceptedImageTypes.has(file.type)) {
      this.uploadErrorMessage.set('Use uma imagem JPG, PNG ou WebP.');
      input.value = '';
      return;
    }

    this.uploadingImage.set(true);
    this.uploadErrorMessage.set(null);

    try {
      const response = await firstValueFrom(this.imageUploadApi.upload(file));

      this.form.controls.image_url.setValue(response.url);
      this.form.controls.image_url.markAsDirty();
      this.form.controls.image_url.markAsTouched();
    } catch {
      this.uploadErrorMessage.set('Falha ao enviar a imagem. Tente novamente.');
    } finally {
      this.uploadingImage.set(false);
      input.value = '';
    }
  }

  clearImage(): void {
    this.form.controls.image_url.setValue(null);
    this.form.controls.image_url.markAsDirty();
    this.form.controls.image_url.markAsTouched();
    this.uploadErrorMessage.set(null);
  }

  private syncFormState(): void {
    const value = toNewsFormValue(this.initialValue);

    this.form.reset(value, { emitEvent: false });
    this.uploadErrorMessage.set(null);

    if (this.isEditMode) {
      this.form.controls.slug.disable({ emitEvent: false });
    } else {
      this.form.controls.slug.enable({ emitEvent: false });
    }
  }
}
