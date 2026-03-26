import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { AdminNewsListItem } from '../../data-access/news-admin.models';
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
  @Input({ required: true }) items: AdminNewsListItem[] = [];
  @Input() actionsDisabled = false;

  @Output() edit = new EventEmitter<number>();
  @Output() publish = new EventEmitter<number>();
  @Output() unpublish = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();

  trackById(_index: number, item: AdminNewsListItem): number {
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
