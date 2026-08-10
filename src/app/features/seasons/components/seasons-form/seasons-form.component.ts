import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormField, disabled, form, pattern, required, submit, validateTree } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { InlineFeedback } from '../../../../shared/components/inline-feedback/inline-feedback';
import type { AdminSeason, CreateAdminSeasonCommand, UpdateAdminSeasonCommand } from '../../domain/admin-season.model';
import { SeasonsImageUploadApiService } from '../../data-access/seasons-image-upload-api.service';
import {
  buildCreateSeasonCommand,
  buildUpdateSeasonCommand,
  createSeasonEditModel,
  hasValidSeasonRange,
  type SeasonEditModel,
} from './season-edit.model';

export type SeasonFormMode = 'create' | 'edit';
export type SeasonFormCommand = CreateAdminSeasonCommand | UpdateAdminSeasonCommand;

@Component({
  selector: 'hsc-seasons-form',
  standalone: true,
  imports: [FormField, InlineFeedback],
  templateUrl: './seasons-form.component.html',
  styleUrl: './seasons-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsFormComponent {
  private readonly imageUploadApi = inject(SeasonsImageUploadApiService);
  private readonly acceptedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

  readonly mode = input<SeasonFormMode>('create');
  readonly initialValue = input<AdminSeason | null>(null);
  readonly submitting = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly formSubmit = output<SeasonFormCommand>();
  readonly cancel = output<void>();

  protected readonly editModel = signal<SeasonEditModel>(createSeasonEditModel());
  protected readonly uploadingImage = signal(false);
  protected readonly uploadErrorMessage = signal<string | null>(null);

  private readonly syncInitialValue = effect(() => {
    this.editModel.set(createSeasonEditModel(this.initialValue()));
    this.uploadErrorMessage.set(null);
  });

  protected readonly seasonForm = form(this.editModel, (f) => {
    disabled(f.slug, { when: () => this.mode() === 'edit' || this.isLocked() });
    disabled(f.name, { when: () => this.isLocked() });
    disabled(f.description, { when: () => this.isLocked() });
    disabled(f.coverImageUrl, { when: () => this.isLocked() });
    disabled(f.startDate, { when: () => this.isLocked() });
    disabled(f.startTime, { when: () => this.isLocked() });
    disabled(f.endDate, { when: () => this.isLocked() });
    disabled(f.endTime, { when: () => this.isLocked() });
    required(f.slug, { message: 'Slug é obrigatório.' });
    required(f.name, { message: 'Nome é obrigatório.' });
    required(f.startDate, { message: 'Data inicial é obrigatória.' });
    required(f.startTime, { message: 'Horário inicial é obrigatório.' });
    pattern(f.startTime, /^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Use um horário válido.' });
    required(f.endDate, { message: 'Data final é obrigatória.' });
    required(f.endTime, { message: 'Horário final é obrigatório.' });
    pattern(f.endTime, /^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Use um horário válido.' });
    validateTree(f, (context) => {
      const value: SeasonEditModel = {
        slug: context.valueOf(f.slug),
        name: context.valueOf(f.name),
        description: context.valueOf(f.description),
        coverImageUrl: context.valueOf(f.coverImageUrl),
        startDate: context.valueOf(f.startDate),
        startTime: context.valueOf(f.startTime),
        endDate: context.valueOf(f.endDate),
        endTime: context.valueOf(f.endTime),
      };
      return hasValidSeasonRange(value)
        ? null
        : { fieldTree: context.fieldTreeOf(f.endDate), kind: 'dateRange', message: 'O término deve ser posterior ao início.' };
    });
  });

  protected isClosed(): boolean {
    return this.initialValue()?.status === 'closed';
  }

  protected isLocked(): boolean {
    return this.submitting() || this.uploadingImage() || this.isClosed();
  }

  protected submitLabel(): string {
    if (this.submitting() || this.uploadingImage()) return 'Processando...';
    return this.mode() === 'edit' ? 'Salvar alterações' : 'Criar season';
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isLocked()) return;
    await submit(this.seasonForm, async (field) => {
      const command = this.mode() === 'edit'
        ? buildUpdateSeasonCommand(field().value())
        : buildCreateSeasonCommand(field().value());
      if (command) this.formSubmit.emit(command);
    });
  }

  protected async onCoverFileSelected(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0] ?? null;
    if (!file || this.isLocked()) { inputElement.value = ''; return; }
    if (!this.acceptedImageTypes.has(file.type)) {
      this.uploadErrorMessage.set('Use uma imagem JPG, PNG ou WebP.');
      inputElement.value = '';
      return;
    }
    this.uploadingImage.set(true);
    this.uploadErrorMessage.set(null);
    try {
      const result = await firstValueFrom(this.imageUploadApi.upload(file));
      this.editModel.update((model) => ({ ...model, coverImageUrl: result.url }));
    } catch {
      this.uploadErrorMessage.set('Falha ao enviar a capa. Tente novamente.');
    } finally {
      this.uploadingImage.set(false);
      inputElement.value = '';
    }
  }

  protected clearCoverImage(): void {
    if (!this.isLocked()) this.editModel.update((model) => ({ ...model, coverImageUrl: '' }));
  }
}
