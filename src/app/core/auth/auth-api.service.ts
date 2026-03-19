import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { AuthSession, AuthUser } from './models/auth.model';
import { AppRole } from './models/role.model';

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

  /**
   * TODO:
   * Reconciliar este endpoint com o contrato final da Auth API.
   * Neste momento, ele existe como ponto único de integração do frontend.
   */
  private readonly sessionEndpoint = '/auth/session';
  private readonly devBootstrapSessionEndpoint = '/auth/dev/bootstrap-session';

  getSession(): Observable<AuthSession> {
    return this.http.get<RawSessionResponse>(this.sessionEndpoint).pipe(
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
