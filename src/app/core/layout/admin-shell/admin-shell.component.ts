import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'hsc-admin-shell',
  imports: [],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShell {}
