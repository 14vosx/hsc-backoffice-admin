import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ConfirmationService } from '../../../../shared/ui/confirmation-dialog/confirmation.service';
import { PageFeedbackComponent } from '../../../../shared/ui/page-feedback/page-feedback.component';
import { UiFeedbackService } from '../../../../shared/ui/ui-feedback.service';
import { SeasonsTableComponent } from '../../components/seasons-table/seasons-table.component';
import { AdminSeasonListItem } from '../../data-access/seasons-admin.models';
import { SeasonsAdminStore } from '../../data-access/seasons-admin.store';

@Component({
  selector: 'hsc-seasons-list-page',
  standalone: true,
  imports: [SeasonsTableComponent, PageFeedbackComponent],
  templateUrl: './seasons-list-page.component.html',
  styleUrl: './seasons-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsListPageComponent implements OnInit {
  private readonly confirmation = inject(ConfirmationService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly router = inject(Router);
  readonly store = inject(SeasonsAdminStore);

  readonly items = this.store.items;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly isEmpty = this.store.isEmpty;
  readonly activeMutation = this.store.activeMutation;

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    try {
      await this.store.load();
    } catch {
      // erro ja refletido na store
    }
  }

  goToCreate(): void {
    void this.router.navigate(['/seasons/new']);
  }

  goToEdit(item: AdminSeasonListItem): void {
    void this.router.navigate(['/seasons', item.slug, 'edit']);
  }

  async activateSeason(item: AdminSeasonListItem): Promise<void> {
    const confirmed = await this.confirmation.confirm({
      title: 'Ativar season',
      message:
        'Ativar esta season como ciclo competitivo oficial em andamento? Se houver outra season ativa, ela poderá deixar de ser ativa.',
      confirmLabel: 'Ativar',
      cancelLabel: 'Cancelar',
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.store.activate(item.slug);
      this.feedback.success('Season ativada com sucesso.');
    } catch {
      this.feedback.error(this.store.error() ?? 'Falha ao ativar season.');
    }
  }

  async closeSeason(item: AdminSeasonListItem): Promise<void> {
    const confirmed = await this.confirmation.confirm({
      title: 'Fechar season',
      message: 'Fechar esta season? Seasons fechadas não podem mais ser editadas.',
      confirmLabel: 'Fechar',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await this.store.close(item.slug);
      this.feedback.success('Season fechada com sucesso.');
    } catch {
      this.feedback.error(this.store.error() ?? 'Falha ao fechar season.');
    }
  }
}
