import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthSessionStore } from '../../core/auth/auth-session.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './app-header.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app-header.css',
})
export class AppHeader {
  protected readonly authSessionStore = inject(AuthSessionStore);

  readonly isDrawerOpen = input(false);
  readonly toggleDrawer = output<void>();

  protected onToggle(): void {
    this.toggleDrawer.emit();
  }
}
