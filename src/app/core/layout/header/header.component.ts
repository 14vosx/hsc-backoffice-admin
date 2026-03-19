import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'hsc-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
