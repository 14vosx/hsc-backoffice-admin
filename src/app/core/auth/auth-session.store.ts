import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthApiService } from './auth-api.service';
import { AuthSessionState } from './models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthSessionStore {
  private readonly authApi = inject(AuthApiService);

  private readonly state = signal<AuthSessionState>({
    status: 'unknown',
    user: null,
    role: null,
    error: null,
  });

  private pendingLoad: Promise<void> | null = null;

  readonly status = computed(() => this.state().status);
  readonly user = computed(() => this.state().user);
  readonly role = computed(() => this.state().role);
  readonly error = computed(() => this.state().error);

  readonly isAuthenticated = computed(() => this.status() === 'authenticated');
  readonly isUnauthenticated = computed(() => this.status() === 'unauthenticated');
  readonly isError = computed(() => this.status() === 'error');

  readonly isViewer = computed(() => this.role() === 'viewer');
  readonly isEditor = computed(() => this.role() === 'editor');
  readonly isAdmin = computed(() => this.role() === 'admin');

  readonly isAdminAreaAllowed = computed(() => {
    const role = this.role();
    return role === 'viewer' || role === 'editor' || role === 'admin';
  });

  async ensureSessionResolved(): Promise<void> {
    if (this.status() !== 'unknown') {
      return;
    }

    if (this.pendingLoad) {
      return this.pendingLoad;
    }

    this.pendingLoad = this.loadSessionInternal().finally(() => {
      this.pendingLoad = null;
    });

    return this.pendingLoad;
  }

  async bootstrapDevSession(): Promise<void> {
    try {
      const session = await firstValueFrom(this.authApi.bootstrapDevSession());

      if (!session.authenticated) {
        this.markUnauthenticated();
        return;
      }

      this.state.set({
        status: 'authenticated',
        user: session.user,
        role: session.role,
        error: null,
      });
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.markUnauthenticated();
        return;
      }

      this.state.set({
        status: 'error',
        user: null,
        role: null,
        error: 'Failed to bootstrap local admin session.',
      });
    }
  }

  clearSession(): void {
    this.state.set({
      status: 'unknown',
      user: null,
      role: null,
      error: null,
    });
  }

  markUnauthenticated(): void {
    this.state.set({
      status: 'unauthenticated',
      user: null,
      role: null,
      error: null,
    });
  }

  private async loadSessionInternal(): Promise<void> {
    this.state.update((current) => ({
      ...current,
      status: 'unknown',
      error: null,
    }));

    try {
      const session = await firstValueFrom(this.authApi.getSession());

      if (!session.authenticated) {
        this.markUnauthenticated();
        return;
      }

      this.state.set({
        status: 'authenticated',
        user: session.user,
        role: session.role,
        error: null,
      });
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.markUnauthenticated();
        return;
      }

      this.state.set({
        status: 'error',
        user: null,
        role: null,
        error: 'Failed to resolve admin session.',
      });
    }
  }
}