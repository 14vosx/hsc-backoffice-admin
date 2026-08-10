import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { StatusBadge, type StatusBadgeVariant } from '../../../../shared/components/status-badge/status-badge';
import type { AdminSeason, AdminSeasonStatus } from '../../domain/admin-season.model';

@Component({
  selector: 'hsc-seasons-table',
  standalone: true,
  imports: [DatePipe, StatusBadge],
  templateUrl: './seasons-table.component.html',
  styleUrl: './seasons-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsTableComponent {
  readonly items = input.required<AdminSeason[]>();
  readonly actionsDisabled = input(false);
  readonly edit = output<AdminSeason>();
  readonly activate = output<AdminSeason>();
  readonly close = output<AdminSeason>();

  protected canEdit(item: AdminSeason): boolean { return item.status !== 'closed'; }
  protected canActivate(item: AdminSeason): boolean { return item.status === 'draft'; }
  protected canClose(item: AdminSeason): boolean { return item.status === 'active'; }
  protected statusLabel(status: AdminSeasonStatus): string {
    return { draft: 'Draft', active: 'Ativa', closed: 'Fechada' }[status];
  }
  protected statusTone(status: AdminSeasonStatus): StatusBadgeVariant {
    return { draft: 'neutral', active: 'active', closed: 'closed' }[status] as StatusBadgeVariant;
  }
}
