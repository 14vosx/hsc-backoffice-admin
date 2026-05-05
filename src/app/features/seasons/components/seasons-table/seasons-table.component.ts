import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { AdminSeasonListItem } from '../../data-access/seasons-admin.models';
import { SeasonsAdminMutationKind } from '../../data-access/seasons-admin.store';
import { SeasonsStatusBadgeComponent } from '../seasons-status-badge/seasons-status-badge.component';

@Component({
  selector: 'hsc-seasons-table',
  standalone: true,
  imports: [DatePipe, MatButtonModule, SeasonsStatusBadgeComponent],
  templateUrl: './seasons-table.component.html',
  styleUrl: './seasons-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsTableComponent {
  @Input({ required: true }) items: AdminSeasonListItem[] = [];
  @Input() activeMutation: SeasonsAdminMutationKind | null = null;

  @Output() edit = new EventEmitter<AdminSeasonListItem>();
  @Output() activate = new EventEmitter<AdminSeasonListItem>();
  @Output() close = new EventEmitter<AdminSeasonListItem>();

  trackById(_index: number, item: AdminSeasonListItem): number {
    return item.id;
  }

  canEdit(item: AdminSeasonListItem): boolean {
    return this.normalizedStatus(item) !== 'closed';
  }

  canActivate(item: AdminSeasonListItem): boolean {
    const status = this.normalizedStatus(item);

    return status !== 'active' && status !== 'closed';
  }

  canClose(item: AdminSeasonListItem): boolean {
    return this.normalizedStatus(item) === 'active';
  }

  editItem(item: AdminSeasonListItem): void {
    this.edit.emit(item);
  }

  activateItem(item: AdminSeasonListItem): void {
    this.activate.emit(item);
  }

  closeItem(item: AdminSeasonListItem): void {
    this.close.emit(item);
  }

  private normalizedStatus(item: AdminSeasonListItem): string {
    return String(item.status).toLowerCase();
  }
}
