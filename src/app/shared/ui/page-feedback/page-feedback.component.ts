import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PageFeedbackVariant } from './page-feedback.models';

@Component({
  selector: 'hsc-page-feedback',
  standalone: true,
  templateUrl: './page-feedback.component.html',
  styleUrl: './page-feedback.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageFeedbackComponent {
  @Input() variant: PageFeedbackVariant = 'neutral';
  @Input() title?: string;
}
