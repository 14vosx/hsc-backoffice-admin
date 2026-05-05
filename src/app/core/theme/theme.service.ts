import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

export type ThemePreference = 'light';

const CONTROLLED_THEME_CLASSES = ['theme-light'];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private preference: ThemePreference = 'light';

  get currentPreference(): ThemePreference {
    return this.preference;
  }

  initialize(): void {
    this.applyTheme(this.preference);
  }

  applyTheme(preference: ThemePreference): void {
    this.preference = preference;

    const root = this.document.documentElement;
    root.classList.remove(...CONTROLLED_THEME_CLASSES);
    root.classList.add('theme-light');
  }
}
