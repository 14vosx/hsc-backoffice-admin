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
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';

import { PageFeedbackComponent } from '../../../../shared/ui/page-feedback/page-feedback.component';
import { AdminSeasonListItem, SeasonFormValue } from '../../data-access/seasons-admin.models';
import { SeasonsImageUploadApiService } from '../../data-access/seasons-image-upload-api.service';
import { toSeasonFormValue } from '../../utils/seasons-form.mapper';

const LOCAL_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

@Component({
  selector: 'hsc-seasons-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    PageFeedbackComponent,
  ],
  templateUrl: './seasons-form.component.html',
  styleUrl: './seasons-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
})
export class SeasonsFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly imageUploadApi = inject(SeasonsImageUploadApiService);
  private readonly acceptedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() initialValue: SeasonFormValue | null = null;
  @Input() metadata: AdminSeasonListItem | null = null;
  @Input() submitting = false;
  @Input() errorMessage: string | null = null;

  @Output() formSubmit = new EventEmitter<SeasonFormValue>();
  @Output() cancel = new EventEmitter<void>();

  readonly uploadingImage = signal(false);
  readonly uploadErrorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      slug: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [''],
      cover_image_url: this.fb.control<string | null>(null),
      startDate: this.fb.control<Date | null>(null, [Validators.required]),
      startTime: ['', [Validators.required, Validators.pattern(LOCAL_TIME_PATTERN)]],
      endDate: this.fb.control<Date | null>(null, [Validators.required]),
      endTime: ['', [Validators.required, Validators.pattern(LOCAL_TIME_PATTERN)]],
    },
    { validators: [seasonDateRangeValidator] },
  );

  get submitLabel(): string {
    if (this.submitting || this.uploadingImage()) {
      return 'Processando...';
    }

    return this.mode === 'edit' ? 'Salvar alterações' : 'Criar season';
  }

  get isClosed(): boolean {
    return (this.metadata?.status ?? '').toLowerCase() === 'closed';
  }

  get isSubmitDisabled(): boolean {
    return this.submitting || this.uploadingImage() || this.isClosed;
  }

  get coverImageUrl(): string | null {
    return this.form.controls.cover_image_url.value;
  }

  get hasDateRangeError(): boolean {
    return this.form.hasError('dateRange') && (
      this.form.controls.startDate.touched ||
      this.form.controls.startTime.touched ||
      this.form.controls.endDate.touched ||
      this.form.controls.endTime.touched
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.initialValue) {
      this.form.reset(toSeasonFormValue(this.initialValue));
      this.uploadErrorMessage.set(null);
    }

    this.syncControlState();
  }

  onSubmit(): void {
    if (this.isClosed) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(toSeasonFormValue(this.form.getRawValue()));
  }

  async onCoverFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file || this.isClosed) {
      input.value = '';
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

      this.form.controls.cover_image_url.setValue(response.url);
      this.form.controls.cover_image_url.markAsDirty();
      this.form.controls.cover_image_url.markAsTouched();
    } catch {
      this.uploadErrorMessage.set('Falha ao enviar a capa. Tente novamente.');
    } finally {
      this.uploadingImage.set(false);
      input.value = '';
    }
  }

  clearCoverImage(): void {
    if (this.isClosed) {
      return;
    }

    this.form.controls.cover_image_url.setValue(null);
    this.form.controls.cover_image_url.markAsDirty();
    this.form.controls.cover_image_url.markAsTouched();
    this.uploadErrorMessage.set(null);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private syncControlState(): void {
    if (this.mode === 'edit') {
      this.form.controls.slug.disable({ emitEvent: false });
    } else {
      this.form.controls.slug.enable({ emitEvent: false });
    }

    if (this.isClosed) {
      this.form.disable({ emitEvent: false });
      return;
    }

    if (this.form.disabled) {
      this.form.enable({ emitEvent: false });
    }

    if (this.mode === 'edit') {
      this.form.controls.slug.disable({ emitEvent: false });
    }
  }
}

function seasonDateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const startDate = control.get('startDate')?.value;
  const startTime = control.get('startTime')?.value;
  const endDate = control.get('endDate')?.value;
  const endTime = control.get('endTime')?.value;

  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    return null;
  }

  if (typeof startTime !== 'string' || typeof endTime !== 'string') {
    return null;
  }

  if (!LOCAL_TIME_PATTERN.test(startTime) || !LOCAL_TIME_PATTERN.test(endTime)) {
    return null;
  }

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const start = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    startHours,
    startMinutes,
  ).getTime();
  const end = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    endHours,
    endMinutes,
  ).getTime();

  return start < end ? null : { dateRange: true };
}
