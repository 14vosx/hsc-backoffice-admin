import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'hsc-news-status-badge',
  standalone: true,
  templateUrl: './news-status-badge.component.html',
  styleUrl: './news-status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsStatusBadgeComponent {
  @Input({ required: true }) status!: string;

  get normalizedStatus(): string {
    return (this.status ?? '').toLowerCase();
  }

  get label(): string {
    return this.normalizedStatus === 'published' ? 'Publicado' : 'Draft';
  }
}
