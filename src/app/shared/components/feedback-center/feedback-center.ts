import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { UiFeedbackService } from '../../state/ui-feedback.service';

@Component({
  selector: 'app-feedback-center',
  templateUrl: './feedback-center.html',
  styleUrl: './feedback-center.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class FeedbackCenter {
  protected readonly feedback = inject(UiFeedbackService);

  protected dismiss(): void {
    this.feedback.dismiss();
  }
}
