import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, map, of, startWith, switchMap } from 'rxjs';

import { InlineFeedback } from '../../../../shared/components/inline-feedback/inline-feedback';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { PlayerAccountsAdminApiService } from '../../data-access/player-accounts-admin-api.service';
import type { AdminPlayerAccount, PlayerAccountStatus } from '../../domain/admin-player-account.model';
import { playerAccountsErrorMessage } from '../../utils/player-accounts-error.mapper';

interface ListQuery { readonly q: string; readonly status: PlayerAccountStatus | null }
interface ListVm { readonly loading: boolean; readonly error: string | null; readonly items: AdminPlayerAccount[]; readonly count: number }

@Component({
  selector: 'hsc-player-accounts-list-page',
  standalone: true,
  imports: [AsyncPipe, DatePipe, RouterLink, PageHeader, InlineFeedback, StatusBadge],
  templateUrl: './player-accounts-list-page.component.html',
  styleUrl: './player-accounts-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerAccountsListPageComponent {
  private readonly api = inject(PlayerAccountsAdminApiService);
  private readonly query$ = new BehaviorSubject<ListQuery>({ q: '', status: null });

  readonly vm$ = this.query$.pipe(switchMap((query) => this.api.listAccounts({ q: query.q || undefined, status: query.status ?? undefined, limit: 50 }).pipe(
    map((result): ListVm => ({ loading: false, error: null, items: result.items, count: result.count })),
    startWith({ loading: true, error: null, items: [], count: 0 } satisfies ListVm),
    catchError((error: unknown) => of({ loading: false, error: playerAccountsErrorMessage(error, 'read'), items: [], count: 0 } satisfies ListVm)),
  )));

  protected search(event: Event): void {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const input = form.elements.namedItem('query') as HTMLInputElement;
    this.query$.next({ ...this.query$.value, q: input.value.trim() });
  }

  protected changeStatus(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query$.next({ ...this.query$.value, status: value === 'active' || value === 'disabled' ? value : null });
  }

  protected compactIdentifier(value: string): string {
    return compactPlayerAccountIdentifier(value);
  }
}

export function compactPlayerAccountIdentifier(value: string): string {
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}…${value.slice(-5)}`;
}
