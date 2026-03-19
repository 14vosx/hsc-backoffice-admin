import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'hsc-dashboard-page',
  imports: [],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {}
