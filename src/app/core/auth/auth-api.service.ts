import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { AuthSession, AuthUser } from './models/auth.model';
import { AppRole } from './models/role.model';

type MagicLinkRequestResponse = {
  ok: boolean;
  message?: string;
};

type RawSessionResponse = Partial<{
  authenticated: boolean;
  user: Partial<AuthUser> | null;
  role: string | null;
}>;

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);

  private readonly sessionEndpoint = `${API_BASE_URL}/auth/session`;
  private readonly requestMagicLinkEndpoint = `${API_BASE_URL}/auth/magic-link/request`;
  private readonly devBootstrapSessionEndpoint = `${API_BASE_URL}/auth/dev/bootstrap-session`;

  getSession(): Observable<AuthSession> {
    return this.http.get<RawSessionResponse>(this.sessionEndpoint, { withCredentials: true }).pipe(
      map((response) => this.normalizeSession(response)),
    );
  }

  bootstrapDevSession(): Observable<AuthSession> {
    return this.http
      .post<RawSessionResponse>(
        this.devBootstrapSessionEndpoint,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(map((response) => this.normalizeSession(response)));
  }

  requestMagicLink(email: string): Observable<MagicLinkRequestResponse> {
  return this.http.post<MagicLinkRequestResponse>(
    this.requestMagicLinkEndpoint,
    { email },
    {
      withCredentials: true,
    },
  );
}

  private normalizeSession(response: RawSessionResponse): AuthSession {
    const authenticated = response.authenticated === true;
    const user = this.normalizeUser(response.user);
    const role = this.normalizeRole(response.role);

    return {
      authenticated,
      user: authenticated ? user : null,
      role: authenticated ? role : null,
    };
  }

  private normalizeUser(user: RawSessionResponse['user']): AuthUser | null {
    if (!user?.id || !user.email || !user.name) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
  
  private normalizeRole(role: string | null | undefined): AppRole | null {
    if (role === 'viewer' || role === 'editor' || role === 'admin') {
      return role;
    }

    return null;
  }
}
