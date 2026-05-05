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
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { PageFeedbackComponent } from '../../../../shared/ui/page-feedback/page-feedback.component';
import { AdminSeasonListItem, SeasonFormValue } from '../../data-access/seasons-admin.models';
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

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() initialValue: SeasonFormValue | null = null;
  @Input() metadata: AdminSeasonListItem | null = null;
  @Input() submitting = false;
  @Input() errorMessage: string | null = null;

  @Output() formSubmit = new EventEmitter<SeasonFormValue>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.nonNullable.group(
    {
      slug: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [''],
      startDate: this.fb.control<Date | null>(null, [Validators.required]),
      startTime: ['', [Validators.required, Validators.pattern(LOCAL_TIME_PATTERN)]],
      endDate: this.fb.control<Date | null>(null, [Validators.required]),
      endTime: ['', [Validators.required, Validators.pattern(LOCAL_TIME_PATTERN)]],
    },
    { validators: [seasonDateRangeValidator] },
  );

  get submitLabel(): string {
    if (this.submitting) {
      return 'Processando...';
    }

    return this.mode === 'edit' ? 'Salvar alterações' : 'Criar season';
  }

  get isClosed(): boolean {
    return (this.metadata?.status ?? '').toLowerCase() === 'closed';
  }

  get isSubmitDisabled(): boolean {
    return this.submitting || this.isClosed;
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
