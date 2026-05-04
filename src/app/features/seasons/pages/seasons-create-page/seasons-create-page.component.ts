import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { SeasonsFormComponent } from '../../components/seasons-form/seasons-form.component';
import { SeasonFormValue } from '../../data-access/seasons-admin.models';
import { SeasonsAdminStore } from '../../data-access/seasons-admin.store';

@Component({
  selector: 'hsc-seasons-create-page',
  standalone: true,
  imports: [SeasonsFormComponent],
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

  async submit(value: SeasonFormValue): Promise<void> {
    try {
      await this.store.create(value);
      await this.router.navigate(['/seasons']);
    } catch {
      // erro já refletido na store
    }
  }

  async cancel(): Promise<void> {
    await this.router.navigate(['/seasons']);
  }
}
