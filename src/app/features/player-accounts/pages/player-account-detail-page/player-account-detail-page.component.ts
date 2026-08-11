import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, map, of, startWith, switchMap, type Observable } from 'rxjs';

import { InlineFeedback } from '../../../../shared/components/inline-feedback/inline-feedback';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge, type StatusBadgeVariant } from '../../../../shared/components/status-badge/status-badge';
import { ConfirmationService } from '../../../../shared/state/confirmation.service';
import { UiFeedbackService } from '../../../../shared/state/ui-feedback.service';
import { MembershipsAdminApiService } from '../../data-access/memberships-admin-api.service';
import { PlayerAccountsAdminApiService } from '../../data-access/player-accounts-admin-api.service';
import type { AdminMembership, AdminMembershipLifecycleAction, AdminMembershipStatus } from '../../domain/admin-membership.model';
import type { AdminPlayerAccount } from '../../domain/admin-player-account.model';
import { isMembershipConcurrentError, isMembershipNotFound, membershipErrorMessage } from '../../utils/memberships-error.mapper';
import { isConcurrentStatusError, playerAccountsErrorMessage } from '../../utils/player-accounts-error.mapper';

interface DetailVm { readonly loading: boolean; readonly error: string | null; readonly item: AdminPlayerAccount | null }
interface MembershipVm { readonly loading: boolean; readonly error: string | null; readonly item: AdminMembership | null }

@Component({
  selector: 'hsc-player-account-detail-page', standalone: true,
  imports: [AsyncPipe, DatePipe, ReactiveFormsModule, RouterLink, PageHeader, InlineFeedback, StatusBadge],
  templateUrl: './player-account-detail-page.component.html', styleUrl: './player-account-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerAccountDetailPageComponent {
  private readonly accountsApi = inject(PlayerAccountsAdminApiService);
  private readonly membershipsApi = inject(MembershipsAdminApiService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly accountReload$ = new BehaviorSubject<void>(undefined);
  private readonly membershipReload$ = new BehaviorSubject<void>(undefined);
  protected readonly accountPending = signal(false);
  protected readonly membershipPending = signal(false);
  protected readonly grantForm = new FormGroup({
    planCode: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(64)] }),
    expiresAt: new FormControl('', { nonNullable: true }),
  });

  readonly vm$ = this.accountReload$.pipe(switchMap(() => this.accountsApi.getAccount(this.id).pipe(
    map((item): DetailVm => ({ loading: false, error: null, item })),
    startWith({ loading: true, error: null, item: null } satisfies DetailVm),
    catchError((error: unknown) => of({ loading: false, error: playerAccountsErrorMessage(error, 'read'), item: null } satisfies DetailVm)),
  )));

  readonly membershipVm$ = this.membershipReload$.pipe(switchMap(() => this.membershipsApi.getByPlayer(this.id).pipe(
    map((item): MembershipVm => ({ loading: false, error: null, item })),
    startWith({ loading: true, error: null, item: null } satisfies MembershipVm),
    catchError((error: unknown) => of({ loading: false, error: isMembershipNotFound(error) ? null : membershipErrorMessage(error, 'read'), item: null } satisfies MembershipVm)),
  )));

  protected retryMembership(): void { this.membershipReload$.next(); }

  protected async grantMembership(): Promise<void> {
    if (this.membershipPending()) return;
    this.grantForm.controls.planCode.setValue(this.grantForm.controls.planCode.value.trim());
    this.grantForm.markAllAsTouched();
    if (this.grantForm.invalid) return;
    const expiresAt = this.utcExpiry(this.grantForm.controls.expiresAt.value);
    if (expiresAt === undefined) {
      this.grantForm.controls.expiresAt.setErrors({ invalidDate: true });
      return;
    }
    const confirmed = await this.confirmation.confirm({
      title: 'Conceder associação',
      message: `Conceder a associação do plano “${this.grantForm.controls.planCode.value}” para esta conta?`,
      confirmLabel: 'Conceder associação', cancelLabel: 'Cancelar',
    });
    if (!confirmed || this.membershipPending()) return;
    this.membershipPending.set(true);
    this.membershipsApi.grant({ playerAccountId: this.id, planCode: this.grantForm.controls.planCode.value, expiresAt }).subscribe({
      next: () => { this.membershipPending.set(false); this.feedback.success('Associação concedida.'); this.grantForm.reset(); this.reloadAccountAndMembership(); },
      error: (error: unknown) => this.handleMembershipError(error, 'grant'),
    });
  }

  protected async changeMembership(item: AdminMembership, action: AdminMembershipLifecycleAction): Promise<void> {
    if (this.membershipPending()) return;
    const labels = this.lifecycleLabels(action);
    const confirmed = await this.confirmation.confirm({ title: labels.title, message: `${labels.title} para esta conta?`, confirmLabel: labels.title, cancelLabel: 'Cancelar' });
    if (!confirmed || this.membershipPending()) return;
    this.membershipPending.set(true);
    this.lifecycleRequest(item.id, action).subscribe({
      next: () => { this.membershipPending.set(false); this.feedback.success(labels.success); this.reloadAccountAndMembership(); },
      error: (error: unknown) => this.handleMembershipError(error, 'lifecycle'),
    });
  }

  protected membershipTone(status: AdminMembershipStatus): StatusBadgeVariant {
    return { inactive: 'neutral', active: 'success', suspended: 'warning', expired: 'danger', cancelled: 'danger' }[status] as StatusBadgeVariant;
  }

  protected async changeStatus(item: AdminPlayerAccount): Promise<void> {
    if (this.accountPending()) return;
    const disabling = item.status === 'active';
    const confirmed = await this.confirmation.confirm({
      title: disabling ? 'Desativar conta' : 'Reativar conta',
      message: disabling ? 'Desativar esta conta? As sessões ativas serão revogadas pelo backend.' : 'Reativar esta conta de jogador?',
      confirmLabel: disabling ? 'Desativar conta' : 'Reativar conta', cancelLabel: 'Cancelar',
    });
    if (!confirmed || this.accountPending()) return;
    this.accountPending.set(true);
    this.accountsApi.updateAccountStatus(item.id, { status: disabling ? 'disabled' : 'active' }).subscribe({
      next: (result) => {
        this.accountPending.set(false);
        const suffix = disabling ? ` ${result.revokedSessions} sessão(ões) revogada(s).` : '';
        this.feedback.success(`${disabling ? 'Conta desativada.' : 'Conta reativada.'}${suffix}`);
        this.accountReload$.next();
      },
      error: (error: unknown) => {
        this.accountPending.set(false);
        const message = playerAccountsErrorMessage(error, 'update');
        if (isConcurrentStatusError(error)) { this.feedback.info(message); this.accountReload$.next(); } else { this.feedback.error(message); }
      },
    });
  }

  private utcExpiry(localValue: string): string | null | undefined {
    if (!localValue) return null;
    const date = new Date(localValue);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  private lifecycleRequest(id: string, action: AdminMembershipLifecycleAction): Observable<AdminMembership> {
    if (action === 'activate') return this.membershipsApi.activate(id);
    if (action === 'suspend') return this.membershipsApi.suspend(id);
    if (action === 'reactivate') return this.membershipsApi.reactivate(id);
    return this.membershipsApi.cancel(id);
  }

  private lifecycleLabels(action: AdminMembershipLifecycleAction): { readonly title: string; readonly success: string } {
    if (action === 'activate') return { title: 'Ativar associação', success: 'Associação ativada.' };
    if (action === 'suspend') return { title: 'Suspender associação', success: 'Associação suspensa.' };
    if (action === 'reactivate') return { title: 'Reativar associação', success: 'Associação reativada.' };
    return { title: 'Cancelar associação', success: 'Associação cancelada.' };
  }

  private handleMembershipError(error: unknown, operation: 'grant' | 'lifecycle'): void {
    this.membershipPending.set(false);
    const message = membershipErrorMessage(error, operation);
    if (isMembershipConcurrentError(error)) { this.feedback.info(message); this.reloadAccountAndMembership(); } else { this.feedback.error(message); }
  }

  private reloadAccountAndMembership(): void { this.accountReload$.next(); this.membershipReload$.next(); }
}
