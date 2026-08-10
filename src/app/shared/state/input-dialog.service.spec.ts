import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { InputDialogService } from './input-dialog.service';

describe('InputDialogService', () => {
  let service: InputDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputDialogService);
  });

  it('should resolve a string and null', async () => {
    const value = service.prompt({ title: 'Name', label: 'Name' });
    service.resolve('Admin');
    await expect(value).resolves.toBe('Admin');

    const cancelled = service.prompt({ title: 'Email', label: 'Email' });
    service.resolve(null);
    await expect(cancelled).resolves.toBeNull();
  });

  it('should process simultaneous requests in FIFO order', async () => {
    const first = service.prompt({ title: 'First', label: 'First' });
    const second = service.prompt({ title: 'Second', label: 'Second' });

    expect(service.activeRequest()?.title).toBe('First');
    service.resolve('one');
    expect(service.activeRequest()?.title).toBe('Second');
    service.resolve('two');

    await expect(first).resolves.toBe('one');
    await expect(second).resolves.toBe('two');
  });
});
