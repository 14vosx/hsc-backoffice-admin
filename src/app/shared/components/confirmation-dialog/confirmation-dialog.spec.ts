import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ConfirmationService } from '../../state/confirmation.service';
import { ConfirmationDialog } from './confirmation-dialog';

describe('ConfirmationDialog', () => {
  let fixture: ComponentFixture<ConfirmationDialog>;
  let service: ConfirmationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmationDialog] }).compileComponents();
    fixture = TestBed.createComponent(ConfirmationDialog);
    service = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    document.body.style.overflow = '';
  });

  it('should render an accessible trapped dialog for the active request', () => {
    service.confirm({ title: 'Delete user', message: 'This cannot be undone.', tone: 'danger' });
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('confirmation-dialog-title');
    expect(dialog.getAttribute('aria-describedby')).toBe('confirmation-dialog-message');
    expect(dialog.getAttribute('cdktrapfocus')).toBeDefined();
    expect(dialog.classList.contains('confirmation-dialog--danger')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Delete user');
  });

  it('should resolve true from confirm and false from cancel', async () => {
    const confirmed = service.confirm({ title: 'Confirm', message: 'Continue?' });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.confirmation-dialog__confirm').click();
    fixture.detectChanges();
    await expect(confirmed).resolves.toBe(true);

    const cancelled = service.confirm({ title: 'Cancel', message: 'Continue?' });
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.confirmation-dialog__button');
    buttons[0].click();
    fixture.detectChanges();
    await expect(cancelled).resolves.toBe(false);
  });

  it('should cancel on Escape and backdrop click', async () => {
    const escapeResult = service.confirm({ title: 'Escape', message: 'Cancel?' });
    fixture.detectChanges();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    await expect(escapeResult).resolves.toBe(false);

    const backdropResult = service.confirm({ title: 'Backdrop', message: 'Cancel?' });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.confirmation-dialog__backdrop').click();
    fixture.detectChanges();
    await expect(backdropResult).resolves.toBe(false);
  });

  it('should restore scroll and focus after closing', () => {
    const origin = document.createElement('button');
    document.body.appendChild(origin);
    origin.focus();
    document.body.style.overflow = 'visible';

    service.confirm({ title: 'Focus', message: 'Restore?' });
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    fixture.nativeElement.querySelector('.confirmation-dialog__confirm').click();
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('visible');
    expect(document.activeElement).toBe(origin);

    origin.remove();
  });
});
