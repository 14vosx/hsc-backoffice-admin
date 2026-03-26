import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { NewsAdminStore } from '../../data-access/news-admin.store';
import { NewsTableComponent } from '../../components/news-table/news-table.component';

@Component({
  selector: 'hsc-news-list-page',
  standalone: true,
  imports: [NewsTableComponent],
  templateUrl: './news-list-page.component.html',
  styleUrl: './news-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsListPageComponent implements OnInit {
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
    try {
      await this.store.publish(id);
    } catch {
      // erro já refletido na store
    }
  }

  async unpublish(id: number): Promise<void> {
    try {
      await this.store.unpublish(id);
    } catch {
      // erro já refletido na store
    }
  }

  async remove(id: number): Promise<void> {
    const confirmed = window.confirm('Deseja remover esta news?');

    if (!confirmed) {
      return;
    }

    try {
      await this.store.remove(id);
    } catch {
      // erro já refletido na store
    }
  }
}
