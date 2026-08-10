import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { AdminNewsStatus } from '../../domain/admin-news.model';

@Component({
  selector: 'hsc-news-status-badge',
  standalone: true,
  templateUrl: './news-status-badge.component.html',
  styleUrl: './news-status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsStatusBadgeComponent {
  @Input({ required: true }) status!: AdminNewsStatus;

  get label(): string {
    return this.status === 'published' ? 'Publicado' : 'Draft';
  }
}
