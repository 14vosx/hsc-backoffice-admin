import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

export interface PrimaryNavItem {
  readonly id: string;
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'app-primary-nav',
  imports: [RouterLink],
  templateUrl: './primary-nav.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './primary-nav.css',
})
export class PrimaryNav {
  @Output() readonly itemSelected = new EventEmitter<void>();

  constructor(private readonly router: Router) {}

  protected readonly navItems: readonly PrimaryNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'seasons', label: 'Seasons', path: '/seasons' },
    { id: 'news', label: 'News', path: '/news' },
    { id: 'users', label: 'Users', path: '/users' },
    { id: 'player-accounts', label: 'Player Accounts', path: '/player-accounts' },
    { id: 'events', label: 'Events', path: '/events' },
  ];

  protected isActive(item: PrimaryNavItem): boolean {
    const url = this.router.url.split(/[?#]/)[0];

    if (item.id === 'dashboard') {
      return url === '/dashboard';
    }

    return url === item.path || url.startsWith(`${item.path}/`);
  }

  protected onLinkClick(): void {
    this.itemSelected.emit();
  }
}
