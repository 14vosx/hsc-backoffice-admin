import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UiFeedbackService } from './ui-feedback.service';

describe('UiFeedbackService', () => {
  let service: UiFeedbackService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiFeedbackService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should expose the correct tones and durations', () => {
    service.success('Success');
    expect(service.activeMessage()).toEqual({ message: 'Success', tone: 'success', duration: 4000 });
    service.dismiss();

    service.info('Info');
    expect(service.activeMessage()).toEqual({ message: 'Info', tone: 'info', duration: 4000 });
    service.dismiss();

    service.error('Error');
    expect(service.activeMessage()).toEqual({ message: 'Error', tone: 'error', duration: 6000 });
  });

  it('should advance queued messages after the current duration', () => {
    service.success('First');
    service.error('Second');

    expect(service.activeMessage()?.message).toBe('First');
    vi.advanceTimersByTime(4000);
    expect(service.activeMessage()?.message).toBe('Second');
    vi.advanceTimersByTime(6000);
    expect(service.activeMessage()).toBeNull();
  });

  it('should dismiss explicitly and advance the queue', () => {
    service.info('First');
    service.success('Second');
    service.dismiss();
    expect(service.activeMessage()?.message).toBe('Second');
  });
});
