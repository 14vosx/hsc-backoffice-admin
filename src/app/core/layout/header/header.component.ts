import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'hsc-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {}
