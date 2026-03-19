import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'hsc-page-container',
  imports: [],
  templateUrl: './page-container.component.html',
  styleUrl: './page-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContainer {}
