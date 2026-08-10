import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
  let service: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmationService);
  });

  it('should resolve true and false', async () => {
    const confirmed = service.confirm({ title: 'Confirm', message: 'Continue?' });
    service.resolve(true);
    await expect(confirmed).resolves.toBe(true);

    const cancelled = service.confirm({ title: 'Cancel', message: 'Continue?' });
    service.resolve(false);
    await expect(cancelled).resolves.toBe(false);
  });

  it('should process simultaneous requests in FIFO order', async () => {
    const first = service.confirm({ title: 'First', message: 'First request' });
    const second = service.confirm({ title: 'Second', message: 'Second request' });

    expect(service.activeRequest()?.title).toBe('First');
    service.resolve(true);
    expect(service.activeRequest()?.title).toBe('Second');
    service.resolve(false);

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(false);
  });
});
