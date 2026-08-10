import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { PrimaryNav } from '../primary-nav/primary-nav';

@Component({
  selector: 'app-sidebar',
  imports: [PrimaryNav],
  templateUrl: './app-sidebar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app-sidebar.css',
})
export class AppSidebar {
  readonly isMobileDrawer = input(false);
  readonly closeRequested = output<void>();

  protected onClose(): void {
    this.closeRequested.emit();
  }
}
