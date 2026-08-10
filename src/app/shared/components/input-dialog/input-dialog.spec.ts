import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { InputDialogService } from '../../state/input-dialog.service';
import { InputDialog } from './input-dialog';

describe('InputDialog', () => {
  let fixture: ComponentFixture<InputDialog>;
  let service: InputDialogService;
  let getClientRectsDescriptor: PropertyDescriptor | undefined;
  let originalGetClientRects: typeof HTMLElement.prototype.getClientRects;

  beforeEach(async () => {
    getClientRectsDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'getClientRects');
    originalGetClientRects = HTMLElement.prototype.getClientRects;
    Object.defineProperty(HTMLElement.prototype, 'getClientRects', {
      configurable: true,
      value(this: HTMLElement): DOMRectList {
        // JSDOM has no layout, so CDK's InteractivityChecker needs test-only geometry
        // for native controls that are genuinely focusable in a browser.
        if (this.matches('input:not([disabled]), button:not([disabled])')) {
          return [new DOMRect(0, 0, 100, 32)] as unknown as DOMRectList;
        }

        return originalGetClientRects.call(this);
      },
    });

    await TestBed.configureTestingModule({ imports: [InputDialog] }).compileComponents();
    fixture = TestBed.createComponent(InputDialog);
    service = TestBed.inject(InputDialogService);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    document.body.style.overflow = '';

    if (getClientRectsDescriptor) {
      Object.defineProperty(HTMLElement.prototype, 'getClientRects', getClientRectsDescriptor);
    } else {
      delete (HTMLElement.prototype as Partial<HTMLElement>)['getClientRects'];
    }
  });

  it('should render initial value, type, hint and accessible relationships', async () => {
    service.prompt({
      title: 'Invite user',
      label: 'Email',
      initialValue: 'admin@hsc.gg',
      inputType: 'email',
      hint: 'Use the administrative email.',
      required: true,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    const input = fixture.nativeElement.querySelector('#input-dialog-control') as HTMLInputElement;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('cdktrapfocus')).toBeDefined();
    expect(input.value).toBe('admin@hsc.gg');
    expect(input.type).toBe('email');
    expect(input.getAttribute('aria-describedby')).toBe('input-dialog-hint');
    expect(fixture.nativeElement.querySelector('label').getAttribute('for')).toBe(input.id);
    expect(fixture.nativeElement.textContent).toContain('Use the administrative email.');
    expect(document.activeElement).toBe(input);
  });

  it('should trim and resolve a confirmed value', async () => {
    const result = service.prompt({ title: 'Name', label: 'Name' });
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#input-dialog-control') as HTMLInputElement;
    input.value = '  Admin User  ';
    input.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('.input-dialog__confirm').click();
    fixture.detectChanges();

    await expect(result).resolves.toBe('Admin User');
  });

  it('should keep a required empty request open and expose an error', () => {
    service.prompt({ title: 'Name', label: 'Name', required: true });
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.input-dialog__confirm').click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#input-dialog-control');
    expect(service.activeRequest()).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#input-dialog-error').textContent).toContain('Informe um valor.');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain('input-dialog-error');
  });

  it('should cancel with null from Escape and the cancel button', async () => {
    const escapeResult = service.prompt({ title: 'Escape', label: 'Value' });
    fixture.detectChanges();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    await expect(escapeResult).resolves.toBeNull();

    const buttonResult = service.prompt({ title: 'Cancel', label: 'Value' });
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.input-dialog__button');
    buttons[0].click();
    fixture.detectChanges();
    await expect(buttonResult).resolves.toBeNull();
  });

  it('should cancel from the backdrop', async () => {
    const result = service.prompt({ title: 'Backdrop', label: 'Value' });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.input-dialog__backdrop').click();
    fixture.detectChanges();
    await expect(result).resolves.toBeNull();
  });

  it('should restore scroll and focus after closing', () => {
    const origin = document.createElement('button');
    document.body.appendChild(origin);
    origin.focus();
    document.body.style.overflow = 'visible';

    service.prompt({ title: 'Focus', label: 'Value' });
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    const buttons = fixture.nativeElement.querySelectorAll('.input-dialog__button');
    buttons[0].click();
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('visible');
    expect(document.activeElement).toBe(origin);

    origin.remove();
  });
});
