import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthSessionStore } from '../../auth/auth-session.store';

@Component({
  selector: 'hsc-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected readonly authSessionStore = inject(AuthSessionStore);
}
