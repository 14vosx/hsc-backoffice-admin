import { AppRole } from './role.model';

export type SessionStatus = 'unknown' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthSession {
  authenticated: boolean;
  user: AuthUser | null;
  role: AppRole | null;
}

export interface AuthSessionState {
  status: SessionStatus;
  user: AuthUser | null;
  role: AppRole | null;
  error: string | null;
}