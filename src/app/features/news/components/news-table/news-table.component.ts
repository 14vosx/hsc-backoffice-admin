import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import type { AdminNews } from '../../domain/admin-news.model';
import { NewsActionsComponent } from '../news-actions/news-actions.component';
import { NewsStatusBadgeComponent } from '../news-status-badge/news-status-badge.component';

@Component({
  selector: 'hsc-news-table',
  standalone: true,
  imports: [DatePipe, NewsActionsComponent, NewsStatusBadgeComponent],
  templateUrl: './news-table.component.html',
  styleUrl: './news-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsTableComponent {
  @Input({ required: true }) items: AdminNews[] = [];
  @Input() actionsDisabled = false;

  @Output() edit = new EventEmitter<number>();
  @Output() publish = new EventEmitter<number>();
  @Output() unpublish = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();

  trackById(_index: number, item: AdminNews): number {
    return item.id;
  }

  onEdit(id: number): void {
    this.edit.emit(id);
  }

  onPublish(id: number): void {
    this.publish.emit(id);
  }

  onUnpublish(id: number): void {
    this.unpublish.emit(id);
  }

  onRemove(id: number): void {
    this.remove.emit(id);
  }
}
