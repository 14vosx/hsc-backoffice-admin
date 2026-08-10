import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormField, disabled, form, required, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { InlineFeedback } from '../../../../shared/components/inline-feedback/inline-feedback';
import { NewsImageUploadApiService } from '../../data-access/news-image-upload-api.service';
import type { AdminNewsDetail, CreateAdminNewsCommand, UpdateAdminNewsCommand } from '../../domain/admin-news.model';
import { buildCreateAdminNewsCommand, buildUpdateAdminNewsCommand, createNewsEditModel, type NewsEditModel } from './news-edit.model';

export type NewsFormMode = 'create' | 'edit';
export type NewsFormCommand = CreateAdminNewsCommand | UpdateAdminNewsCommand;

@Component({
  selector: 'hsc-news-form', standalone: true, imports: [DatePipe, FormField, InlineFeedback],
  templateUrl: './news-form.component.html', styleUrl: './news-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsFormComponent {
  private readonly imageUploadApi = inject(NewsImageUploadApiService);
  private readonly acceptedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

  readonly mode = input<NewsFormMode>('create');
  readonly initialValue = input<AdminNewsDetail | null>(null);
  readonly submitting = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly formSubmit = output<NewsFormCommand>();
  readonly cancel = output<void>();

  protected readonly editModel = signal<NewsEditModel>(createNewsEditModel());
  protected readonly uploadingImage = signal(false);
  protected readonly uploadErrorMessage = signal<string | null>(null);

  private readonly syncInitialValue = effect(() => {
    this.editModel.set(createNewsEditModel(this.initialValue()));
    this.uploadErrorMessage.set(null);
  });

  protected readonly newsForm = form(this.editModel, (fields) => {
    disabled(fields.slug, { when: () => this.mode() === 'edit' || this.isLocked() });
    disabled(fields.title, { when: () => this.isLocked() });
    disabled(fields.content, { when: () => this.isLocked() });
    disabled(fields.imageUrl, { when: () => this.isLocked() });
    required(fields.slug, { message: 'Slug é obrigatório.' });
    required(fields.title, { message: 'Título é obrigatório.' });
    required(fields.content, { message: 'Conteúdo é obrigatório.' });
  });

  protected isLocked(): boolean { return this.submitting() || this.uploadingImage(); }
  protected submitLabel(): string {
    if (this.isLocked()) return 'Processando...';
    return this.mode() === 'edit' ? 'Salvar alterações' : 'Criar draft';
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isLocked()) return;
    await submit(this.newsForm, async (field) => {
      const command = this.mode() === 'edit'
        ? buildUpdateAdminNewsCommand(field().value())
        : buildCreateAdminNewsCommand(field().value());
      this.formSubmit.emit(command);
    });
  }

  protected async onImageFileSelected(event: Event): Promise<void> {
    if (!(event.target instanceof HTMLInputElement)) return;
    const inputElement = event.target;
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
      this.editModel.update((model) => ({ ...model, imageUrl: result.url }));
    } catch {
      this.uploadErrorMessage.set('Falha ao enviar a imagem. Tente novamente.');
    } finally {
      this.uploadingImage.set(false);
      inputElement.value = '';
    }
  }

  protected clearImage(): void {
    if (!this.isLocked()) this.editModel.update((model) => ({ ...model, imageUrl: '' }));
    this.uploadErrorMessage.set(null);
  }
}
