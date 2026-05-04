import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { AdminSeasonListItem } from '../../data-access/seasons-admin.models';
import { SeasonsStatusBadgeComponent } from '../seasons-status-badge/seasons-status-badge.component';

@Component({
  selector: 'hsc-seasons-table',
  standalone: true,
  imports: [DatePipe, SeasonsStatusBadgeComponent],
  templateUrl: './seasons-table.component.html',
  styleUrl: './seasons-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsTableComponent {
  @Input({ required: true }) items: AdminSeasonListItem[] = [];

  trackById(_index: number, item: AdminSeasonListItem): number {
    return item.id;
  }
}
