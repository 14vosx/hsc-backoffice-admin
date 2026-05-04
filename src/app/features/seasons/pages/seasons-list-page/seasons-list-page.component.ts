import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { SeasonsTableComponent } from '../../components/seasons-table/seasons-table.component';
import { AdminSeasonListItem } from '../../data-access/seasons-admin.models';
import { SeasonsAdminStore } from '../../data-access/seasons-admin.store';

@Component({
  selector: 'hsc-seasons-list-page',
  standalone: true,
  imports: [SeasonsTableComponent],
  templateUrl: './seasons-list-page.component.html',
  styleUrl: './seasons-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsListPageComponent implements OnInit {
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
    const confirmed = window.confirm(
      'Ativar esta season como ciclo competitivo oficial em andamento? Se houver outra season ativa, ela poderá deixar de ser ativa.',
    );

    if (!confirmed) {
      return;
    }

    try {
      await this.store.activate(item.slug);
    } catch {
      // erro ja refletido na store
    }
  }

  async closeSeason(item: AdminSeasonListItem): Promise<void> {
    const confirmed = window.confirm(
      'Fechar esta season? Seasons fechadas não podem mais ser editadas.',
    );

    if (!confirmed) {
      return;
    }

    try {
      await this.store.close(item.slug);
    } catch {
      // erro ja refletido na store
    }
  }
}
