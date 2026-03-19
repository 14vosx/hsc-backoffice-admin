import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'hsc-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {}
