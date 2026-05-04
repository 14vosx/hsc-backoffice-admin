import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { SeasonsTableComponent } from '../../components/seasons-table/seasons-table.component';
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
  readonly store = inject(SeasonsAdminStore);

  readonly items = this.store.items;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly isEmpty = this.store.isEmpty;

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
}
