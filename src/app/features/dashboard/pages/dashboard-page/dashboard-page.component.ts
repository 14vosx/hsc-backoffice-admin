import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageContainerComponent } from '../../../../core/layout/page-container/page-container.component';

@Component({
  selector: 'hsc-dashboard-page',
  standalone: true,
  imports: [RouterLink, PageContainerComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {}