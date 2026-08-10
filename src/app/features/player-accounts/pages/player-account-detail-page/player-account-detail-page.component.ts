import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, map, of, startWith, switchMap } from 'rxjs';

import { InlineFeedback } from '../../../../shared/components/inline-feedback/inline-feedback';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { ConfirmationService } from '../../../../shared/state/confirmation.service';
import { UiFeedbackService } from '../../../../shared/state/ui-feedback.service';
import { PlayerAccountsAdminApiService } from '../../data-access/player-accounts-admin-api.service';
import type { AdminPlayerAccount } from '../../domain/admin-player-account.model';
import { isConcurrentStatusError, playerAccountsErrorMessage } from '../../utils/player-accounts-error.mapper';

interface DetailVm { readonly loading: boolean; readonly error: string | null; readonly item: AdminPlayerAccount | null }

@Component({
  selector: 'hsc-player-account-detail-page', standalone: true,
  imports: [AsyncPipe, DatePipe, RouterLink, PageHeader, InlineFeedback, StatusBadge],
  templateUrl: './player-account-detail-page.component.html', styleUrl: './player-account-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerAccountDetailPageComponent {
  private readonly api = inject(PlayerAccountsAdminApiService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly reload$ = new BehaviorSubject<void>(undefined);
  protected readonly pending = signal(false);
  readonly vm$ = this.reload$.pipe(switchMap(() => this.api.getAccount(this.id).pipe(
    map((item): DetailVm => ({ loading: false, error: null, item })),
    startWith({ loading: true, error: null, item: null } satisfies DetailVm),
    catchError((error: unknown) => of({ loading: false, error: playerAccountsErrorMessage(error, 'read'), item: null } satisfies DetailVm)),
  )));

  protected async changeStatus(item: AdminPlayerAccount): Promise<void> {
    if (this.pending()) return;
    const disabling = item.status === 'active';
    const confirmed = await this.confirmation.confirm({
      title: disabling ? 'Desativar conta' : 'Reativar conta',
      message: disabling ? 'Desativar esta conta? As sessões ativas serão revogadas pelo backend.' : 'Reativar esta conta de jogador?',
      confirmLabel: disabling ? 'Desativar conta' : 'Reativar conta', cancelLabel: 'Cancelar',
    });
    if (!confirmed || this.pending()) return;
    this.pending.set(true);
    this.api.updateAccountStatus(item.id, { status: disabling ? 'disabled' : 'active' }).subscribe({
      next: (result) => {
        this.pending.set(false);
        const suffix = disabling ? ` ${result.revokedSessions} sessão(ões) revogada(s).` : '';
        this.feedback.success(`${disabling ? 'Conta desativada.' : 'Conta reativada.'}${suffix}`);
        this.reload$.next();
      },
      error: (error: unknown) => {
        this.pending.set(false);
        const message = playerAccountsErrorMessage(error, 'update');
        if (isConcurrentStatusError(error)) { this.feedback.info(message); this.reload$.next(); } else { this.feedback.error(message); }
      },
    });
  }
}
