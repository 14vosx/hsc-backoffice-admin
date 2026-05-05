import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

import { PageContainerComponent } from '../../../../core/layout/page-container/page-container.component';
import { ConfirmationService } from '../../../../shared/ui/confirmation-dialog/confirmation.service';
import { PageFeedbackComponent } from '../../../../shared/ui/page-feedback/page-feedback.component';
import { UiFeedbackService } from '../../../../shared/ui/ui-feedback.service';
import { NewsAdminStore } from '../../data-access/news-admin.store';
import { NewsTableComponent } from '../../components/news-table/news-table.component';

@Component({
  selector: 'hsc-news-list-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    PageContainerComponent,
    NewsTableComponent,
    PageFeedbackComponent,
  ],
  templateUrl: './news-list-page.component.html',
  styleUrl: './news-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsListPageComponent implements OnInit {
  private readonly confirmation = inject(ConfirmationService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly router = inject(Router);
  readonly store = inject(NewsAdminStore);

  readonly items = this.store.items;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly isEmpty = this.store.isEmpty;
  readonly activeMutation = this.store.activeMutation;

  readonly actionsDisabled = computed(
    () => this.loading() || this.activeMutation() !== null,
  );

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    try {
      await this.store.load();
    } catch {
      // erro já refletido na store
    }
  }

  goToCreate(): void {
    void this.router.navigate(['/news/new']);
  }

  goToEdit(id: number): void {
    void this.router.navigate(['/news', id, 'edit']);
  }

  async publish(id: number): Promise<void> {
    const confirmed = await this.confirmation.confirm({
      title: 'Publicar news',
      message: 'Publicar esta news no portal?',
      confirmLabel: 'Publicar',
      cancelLabel: 'Cancelar',
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.store.publish(id);
      this.feedback.success('News publicada com sucesso.');
    } catch {
      this.feedback.error(this.store.error() ?? 'Falha ao publicar news.');
    }
  }

  async unpublish(id: number): Promise<void> {
    const confirmed = await this.confirmation.confirm({
      title: 'Despublicar news',
      message: 'Despublicar esta news do portal?',
      confirmLabel: 'Despublicar',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.store.unpublish(id);
      this.feedback.success('News despublicada com sucesso.');
    } catch {
      this.feedback.error(this.store.error() ?? 'Falha ao despublicar news.');
    }
  }

  async remove(id: number): Promise<void> {
    const confirmed = await this.confirmation.confirm({
      title: 'Remover news',
      message: 'Deseja remover esta news? Esta ação não pode ser desfeita.',
      confirmLabel: 'Remover',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.store.remove(id);
      this.feedback.success('News removida com sucesso.');
    } catch {
      this.feedback.error(this.store.error() ?? 'Falha ao remover news.');
    }
  }
}
