import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmationService } from '../../../../shared/state/confirmation.service';
import { InputDialogService } from '../../../../shared/state/input-dialog.service';
import { UiFeedbackService } from '../../../../shared/state/ui-feedback.service';
import { UsersAdminApiService } from '../../data-access/users-admin-api.service';
import type { AdminUser } from '../../domain/admin-user.model';
import { UsersPageComponent } from './users-page.component';

const user: AdminUser = {
  id: 7,
  email: 'admin@hsc.gg',
  displayName: 'Admin User',
  role: 'admin',
  createdAt: null,
  updatedAt: null,
};

describe('UsersPageComponent', () => {
  let fixture: ComponentFixture<UsersPageComponent>;
  const api = {
    listUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
  };
  const confirmation = { confirm: vi.fn() };
  const inputDialog = { prompt: vi.fn() };
  const feedback = { success: vi.fn(), error: vi.fn(), info: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    api.listUsers.mockReturnValue(of({ items: [user], count: 1 }));
    api.createUser.mockReturnValue(of(user));
    api.updateUser.mockReturnValue(of(user));
    confirmation.confirm.mockResolvedValue(true);
    inputDialog.prompt.mockResolvedValue(null);

    await TestBed.configureTestingModule({
      imports: [UsersPageComponent],
      providers: [
        { provide: UsersAdminApiService, useValue: api },
        { provide: ConfirmationService, useValue: confirmation },
        { provide: InputDialogService, useValue: inputDialog },
        { provide: UiFeedbackService, useValue: feedback },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
  });

  it('should derive native role options from the domain roles', () => {
    const select = fixture.nativeElement.querySelector('#create-user-role') as HTMLSelectElement;
    expect(Array.from(select.options).map((option) => option.value)).toEqual(['admin', 'editor', 'viewer']);
  });

  it('should submit a normalized camelCase command from native inputs', () => {
    setInput('create-user-email', '  ADMIN@HSC.GG  ');
    setInput('create-user-name', '  Admin User  ');
    setSelect('create-user-role', 'editor');
    submit();

    expect(api.createUser).toHaveBeenCalledWith({
      email: 'admin@hsc.gg',
      displayName: 'Admin User',
      role: 'editor',
    });
    expect(feedback.success).toHaveBeenCalledWith('Usuário criado com sucesso.');
    expect((fixture.nativeElement.querySelector('#create-user-email') as HTMLInputElement).value).toBe('');
  });

  it('should reject invalid input without calling data-access', () => {
    setInput('create-user-email', 'invalid');
    submit();
    expect(api.createUser).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('#create-user-email-error').textContent).toContain('Use um email válido.');
  });

  it('should keep controls pending and ignore duplicate creation', () => {
    api.createUser.mockReturnValue(new Subject());
    setInput('create-user-email', 'admin@hsc.gg');
    setInput('create-user-name', 'Admin User');
    submit();
    submit();

    expect(api.createUser).toHaveBeenCalledTimes(1);
    expect((fixture.nativeElement.querySelector('#create-user-email') as HTMLInputElement).disabled).toBe(true);
  });

  it('should retain state and report a create error', () => {
    api.createUser.mockReturnValue(throwError(() => new Error('backend detail')));
    setInput('create-user-email', 'admin@hsc.gg');
    setInput('create-user-name', 'Admin User');
    submit();

    expect(feedback.error).toHaveBeenCalledWith('Não foi possível criar o usuário.');
    expect((fixture.nativeElement.querySelector('#create-user-email') as HTMLInputElement).value).toBe('admin@hsc.gg');
  });

  it('should use domain camelCase for existing rename actions', async () => {
    inputDialog.prompt.mockResolvedValue('Renamed User');
    await fixture.componentInstance.renameUser(user);

    expect(inputDialog.prompt).toHaveBeenCalledWith(expect.objectContaining({ initialValue: 'Admin User' }));
    expect(api.updateUser).toHaveBeenCalledWith(7, { displayName: 'Renamed User' });
  });

  function setInput(id: string, value: string): void {
    const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function setSelect(id: string, value: string): void {
    const select = fixture.nativeElement.querySelector(`#${id}`) as HTMLSelectElement;
    select.value = value;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  function submit(): void {
    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', new Event('submit'));
    fixture.detectChanges();
  }
});
