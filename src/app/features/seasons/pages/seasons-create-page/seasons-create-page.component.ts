import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { PageContainerComponent } from '../../../../layout/page-container/page-container.component';
import { UiCard } from '../../../../shared/components/card/card';
import { SeasonsFormComponent, type SeasonFormCommand } from '../../components/seasons-form/seasons-form.component';
import { SeasonsAdminStore } from '../../state/seasons-admin.store';

@Component({
  selector: 'hsc-seasons-create-page',
  standalone: true,
  imports: [PageContainerComponent, SeasonsFormComponent, UiCard],
  templateUrl: './seasons-create-page.component.html',
  styleUrl: './seasons-create-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsCreatePageComponent implements OnInit {
  private readonly router = inject(Router);
  readonly store = inject(SeasonsAdminStore);

  readonly error = this.store.error;
  readonly submitting = computed(() => this.store.activeMutation() === 'create');

  ngOnInit(): void {
    this.store.resetError();
  }

  async submit(command: SeasonFormCommand): Promise<void> {
    if (!('slug' in command)) return;
    try {
      await this.store.create(command);
      await this.router.navigate(['/seasons']);
    } catch {
      // erro já refletido na store
    }
  }

  async cancel(): Promise<void> {
    await this.router.navigate(['/seasons']);
  }
}
