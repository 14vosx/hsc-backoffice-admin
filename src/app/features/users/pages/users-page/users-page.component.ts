import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, catchError, map, of, startWith, switchMap } from 'rxjs';

import { PageContainerComponent } from '../../../../layout/page-container/page-container.component';
import { UiCard } from '../../../../shared/components/card/card';
import { InlineFeedback } from '../../../../shared/components/inline-feedback/inline-feedback';
import { ConfirmationService } from '../../../../shared/state/confirmation.service';
import { InputDialogService } from '../../../../shared/state/input-dialog.service';
import { UiFeedbackService } from '../../../../shared/state/ui-feedback.service';
import { UsersAdminApiService } from '../../data-access/users-admin-api.service';
import {
  ADMIN_USER_ROLES,
  isAdminUserRole,
  type AdminUser,
  type AdminUserRole,
} from '../../domain/admin-user.model';
import {
  buildAdminUserCreateCommand,
  validateAdminUserCreate,
} from './admin-user-create.model';

type UsersPageVm = {
  loading: boolean;
  error: string | null;
  items: AdminUser[];
  count: number;
};

@Component({
  selector: 'hsc-users-page',
  standalone: true,
  imports: [
    AsyncPipe,
    PageContainerComponent,
    UiCard,
    InlineFeedback,
  ],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent {
  private readonly confirmation = inject(ConfirmationService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly inputDialog = inject(InputDialogService);
  private readonly usersAdminApi = inject(UsersAdminApiService);
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  protected readonly roleOptions = ADMIN_USER_ROLES;
  protected readonly email = signal('');
  protected readonly displayName = signal('');
  protected readonly role = signal<AdminUserRole>('admin');
  protected readonly createPending = signal(false);
  protected readonly createSubmitted = signal(false);
  protected readonly createError = signal<string | null>(null);
  protected readonly createValidation = computed(() =>
    validateAdminUserCreate({
      email: this.email(),
      displayName: this.displayName(),
      role: this.role(),
    }),
  );

  readonly vm$ = this.reload$.pipe(
    switchMap(() =>
      this.usersAdminApi.listUsers().pipe(
        map((response): UsersPageVm => ({
          loading: false,
          error: null,
          items: response.items,
          count: response.count,
        })),
        startWith({
          loading: true,
          error: null,
          items: [],
          count: 0,
        } satisfies UsersPageVm),
        catchError(() =>
          of({
            loading: false,
            error: 'Não foi possível carregar os usuários.',
            items: [],
            count: 0,
          } satisfies UsersPageVm),
        ),
      ),
    ),
  );

  submitCreate(event: Event): void {
    event.preventDefault();
    if (this.createPending()) {
      return;
    }

    this.createSubmitted.set(true);
    const command = buildAdminUserCreateCommand({
      email: this.email(),
      displayName: this.displayName(),
      role: this.role(),
    });
    if (!command) {
      return;
    }

    this.createPending.set(true);
    this.createError.set(null);
    this.usersAdminApi
      .createUser(command)
      .subscribe({
        next: () => {
          this.createPending.set(false);
          this.email.set('');
          this.displayName.set('');
          this.role.set('admin');
          this.createSubmitted.set(false);
          this.reload$.next();
          this.feedback.success('Usuário criado com sucesso.');
        },
        error: () => {
          this.createPending.set(false);
          this.createError.set('Não foi possível criar o usuário.');
          this.feedback.error('Não foi possível criar o usuário.');
        },
      });
  }

  protected updateEmail(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    this.clearCreateError();
  }

  protected updateDisplayName(event: Event): void {
    this.displayName.set((event.target as HTMLInputElement).value);
    this.clearCreateError();
  }

  protected updateRole(event: Event): void {
    const role = (event.target as HTMLSelectElement).value;
    if (isAdminUserRole(role)) {
      this.role.set(role);
      this.clearCreateError();
    }
  }

  async changeRole(item: AdminUser, role: AdminUserRole): Promise<void> {
    if (item.role === role) {
      return;
    }

    const confirmed = await this.confirmation.confirm({
      title: 'Alterar role do usuário',
      message: `Alterar a role de ${item.email} para ${role}? Essa mudança pode afetar permissões de acesso.`,
      confirmLabel: 'Alterar role',
      cancelLabel: 'Cancelar',
    });

    if (!confirmed) {
      return;
    }

    this.usersAdminApi
      .updateUser(item.id, { role })
      .subscribe({
        next: () => {
          this.reload$.next();
          this.feedback.success('Role do usuário atualizada com sucesso.');
        },
        error: () => {
          this.feedback.error('Não foi possível atualizar a role do usuário.');
        },
      });
  }

  async renameUser(item: AdminUser): Promise<void> {
    const currentName = item.displayName ?? '';
    const nextName = await this.inputDialog.prompt({
      title: 'Renomear usuário',
      label: 'Nome do usuário',
      initialValue: currentName,
      confirmLabel: 'Salvar nome',
      cancelLabel: 'Cancelar',
      inputType: 'text',
      required: true,
    });

    if (nextName == null) {
      return;
    }

    const cleanName = nextName.trim();
    if (!cleanName || cleanName === currentName) {
      return;
    }

    this.usersAdminApi
      .updateUser(item.id, { displayName: cleanName })
      .subscribe({
        next: () => {
          this.reload$.next();
          this.feedback.success('Nome do usuário atualizado com sucesso.');
        },
        error: () => {
          this.feedback.error('Não foi possível atualizar o nome do usuário.');
        },
      });
  }

  async changeEmail(item: AdminUser): Promise<void> {
    const currentEmail = item.email;
    const nextEmail = await this.inputDialog.prompt({
      title: 'Alterar email do usuário',
      label: 'Email do usuário',
      initialValue: currentEmail,
      confirmLabel: 'Salvar email',
      cancelLabel: 'Cancelar',
      inputType: 'email',
      required: true,
      hint: 'Use um email válido. A validação final é feita pelo backend.',
    });

    if (nextEmail == null) {
      return;
    }

    const cleanEmail = nextEmail.trim().toLowerCase();
    if (!cleanEmail || cleanEmail === currentEmail) {
      return;
    }

    this.usersAdminApi
      .updateUser(item.id, { email: cleanEmail })
      .subscribe({
        next: () => {
          this.reload$.next();
          this.feedback.success('Email do usuário atualizado com sucesso.');
        },
        error: () => {
          this.feedback.error('Não foi possível atualizar o email do usuário.');
        },
      });
  }

  private clearCreateError(): void {
    if (this.createError()) {
      this.createError.set(null);
    }
  }
}
