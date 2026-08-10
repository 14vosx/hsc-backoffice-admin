import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type InlineFeedbackVariant = 'neutral' | 'error' | 'success' | 'warning';

@Component({
  selector: 'app-inline-feedback',
  templateUrl: './inline-feedback.html',
  styleUrl: './inline-feedback.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[class]': '`inline-feedback inline-feedback--${variant()}`',
    '[attr.role]': "variant() === 'error' ? 'alert' : 'status'",
    '[attr.aria-live]': "variant() === 'error' ? 'assertive' : 'polite'",
  },
})
export class InlineFeedback {
  readonly variant = input<InlineFeedbackVariant>('neutral');
}
