import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, catchError, map, of, startWith, switchMap } from 'rxjs';

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
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent {
  private readonly fb = inject(FormBuilder);
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
        },
        error: () => {
          alert('Não foi possível criar o usuário.');
        },
      });
  }

  changeRole(item: AdminUserListItem, role: AdminUserRole): void {
    if (item.role === role) {
      return;
    }

    this.usersAdminApi
      .updateUser(item.id, { role })
      .subscribe({
        next: () => {
          this.reload$.next();
        },
        error: () => {
          alert('Não foi possível atualizar a role do usuário.');
        },
      });
  }

  renameUser(item: AdminUserListItem): void {
    const currentName = item.display_name ?? '';
    const nextName = window.prompt('Novo nome do usuário:', currentName);

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
        },
        error: () => {
          alert('Não foi possível atualizar o nome do usuário.');
        },
      });
  }

  changeEmail(item: AdminUserListItem): void {
    const currentEmail = item.email;
    const nextEmail = window.prompt('Novo email do usuário:', currentEmail);

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
        },
        error: () => {
          alert('Não foi possível atualizar o email do usuário.');
        },
      });
  }
}
