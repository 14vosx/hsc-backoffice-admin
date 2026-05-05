import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    service = TestBed.inject(ThemeService);
    document = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    document.documentElement.classList.remove('theme-light');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should apply theme-light on initialize', () => {
    service.initialize();

    expect(document.documentElement.classList.contains('theme-light')).toBe(true);
    expect(service.currentPreference).toBe('light');
  });

  it('should apply theme-light when applying light preference', () => {
    document.documentElement.classList.remove('theme-light');

    service.applyTheme('light');

    expect(document.documentElement.classList.contains('theme-light')).toBe(true);
    expect(service.currentPreference).toBe('light');
  });
});
