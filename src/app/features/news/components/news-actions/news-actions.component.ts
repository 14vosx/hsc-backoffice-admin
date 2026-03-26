import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'hsc-news-actions',
  standalone: true,
  templateUrl: './news-actions.component.html',
  styleUrl: './news-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsActionsComponent {
  @Input({ required: true }) itemId!: number;
  @Input({ required: true }) status!: string;
  @Input() disabled = false;

  @Output() edit = new EventEmitter<number>();
  @Output() publish = new EventEmitter<number>();
  @Output() unpublish = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();

  get isPublished(): boolean {
    return (this.status ?? '').toLowerCase() === 'published';
  }

  onEdit(): void {
    this.edit.emit(this.itemId);
  }

  onPublish(): void {
    this.publish.emit(this.itemId);
  }

  onUnpublish(): void {
    this.unpublish.emit(this.itemId);
  }

  onRemove(): void {
    this.remove.emit(this.itemId);
  }
}
