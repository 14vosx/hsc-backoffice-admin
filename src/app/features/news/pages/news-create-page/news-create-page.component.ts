import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { NewsFormComponent } from '../../components/news-form/news-form.component';
import { NewsAdminStore } from '../../data-access/news-admin.store';
import { NewsFormValue } from '../../data-access/news-admin.models';

@Component({
  selector: 'hsc-news-create-page',
  standalone: true,
  imports: [NewsFormComponent],
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

  async submit(value: NewsFormValue): Promise<void> {
    try {
      const response = await this.store.create(value);

      await this.router.navigate(['/news', response.id, 'edit']);
    } catch {
      // erro já refletido na store
    }
  }

  async cancel(): Promise<void> {
    await this.router.navigate(['/news']);
  }
}
