import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { PageContainerComponent } from '../../../../layout/page-container/page-container.component';
import { UiCard } from '../../../../shared/components/card/card';
import { NewsFormComponent, type NewsFormCommand } from '../../components/news-form/news-form.component';
import { NewsAdminStore } from '../../state/news-admin.store';

@Component({
  selector: 'hsc-news-create-page',
  standalone: true,
  imports: [UiCard, PageContainerComponent, NewsFormComponent],
  templateUrl: './news-create-page.component.html',
  styleUrl: './news-create-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsCreatePageComponent implements OnInit {
  private readonly router = inject(Router);
  readonly store = inject(NewsAdminStore);

  readonly error = this.store.error;
  readonly submitting = computed(() => this.store.activeMutation() === 'create');

  ngOnInit(): void {
    this.store.resetError();
  }

  async submit(command: NewsFormCommand): Promise<void> {
    if (!('slug' in command)) return;
    try {
      const response = await this.store.create(command);

      await this.router.navigate(['/news', response.id, 'edit']);
    } catch {
      // erro já refletido na store
    }
  }

  async cancel(): Promise<void> {
    await this.router.navigate(['/news']);
  }
}
