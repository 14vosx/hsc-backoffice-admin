import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'hsc-page-container',
  standalone: true,
  templateUrl: './page-container.component.html',
  styleUrl: './page-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContainerComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
