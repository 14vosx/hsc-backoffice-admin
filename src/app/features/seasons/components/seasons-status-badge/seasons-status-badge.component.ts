import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'hsc-seasons-status-badge',
  standalone: true,
  templateUrl: './seasons-status-badge.component.html',
  styleUrl: './seasons-status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsStatusBadgeComponent {
  @Input({ required: true }) status!: string;

  get normalizedStatus(): string {
    const normalized = (this.status ?? '').toLowerCase();

    return ['draft', 'active', 'closed'].includes(normalized) ? normalized : 'unknown';
  }

  get label(): string {
    switch (this.normalizedStatus) {
      case 'draft':
        return 'Draft';
      case 'active':
        return 'Ativa';
      case 'closed':
        return 'Fechada';
      default:
        return this.status;
    }
  }
}
