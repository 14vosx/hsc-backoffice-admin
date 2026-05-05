import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, catchError, map, of, startWith, switchMap } from 'rxjs';

import { PageContainerComponent } from '../../../../core/layout/page-container/page-container.component';
import { ConfirmationService } from '../../../../shared/ui/confirmation-dialog/confirmation.service';
import { InputDialogService } from '../../../../shared/ui/input-dialog/input-dialog.service';
import { PageFeedbackComponent } from '../../../../shared/ui/page-feedback/page-feedback.component';
import { UiFeedbackService } from '../../../../shared/ui/ui-feedback.service';
import {
  AdminUserListItem,
  AdminUserRole,
  UsersAdminApiService,
} from '../../data-access/users-admin-api.service';

type UsersPageVm = {
  loading: boolean;
  error: string | null;
  items: AdminUserListItem[];
  count: number;
};

@Component({
  selector: 'hsc-users-page',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PageContainerComponent,
    PageFeedbackComponent,
  ],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly feedback = inject(UiFeedbackService);
  private readonly inputDialog = inject(InputDialogService);
  private readonly usersAdminApi = inject(UsersAdminApiService);
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  readonly createForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    display_name: ['', [Validators.required]],
    role: ['admin' as AdminUserRole, [Validators.required]],
  });

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

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const raw = this.createForm.getRawValue();

    this.usersAdminApi
      .createUser({
        email: raw.email.trim(),
        display_name: raw.display_name.trim(),
        role: raw.role,
      })
      .subscribe({
        next: () => {
          this.createForm.reset({
            email: '',
            display_name: '',
            role: 'admin',
          });
          this.reload$.next();
          this.feedback.success('Usuário criado com sucesso.');
        },
        error: () => {
          this.feedback.error('Não foi possível criar o usuário.');
        },
      });
  }

  async changeRole(item: AdminUserListItem, role: AdminUserRole): Promise<void> {
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

  async renameUser(item: AdminUserListItem): Promise<void> {
    const currentName = item.display_name ?? '';
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
      .updateUser(item.id, { display_name: cleanName })
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

  async changeEmail(item: AdminUserListItem): Promise<void> {
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
}
