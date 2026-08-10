export type PlayerAccountStatus = 'active' | 'disabled';
export type PlayerProfileVisibility = 'private' | 'public';
export type PlayerMembershipStatus =
  | 'inactive'
  | 'active'
  | 'suspended'
  | 'expired'
  | 'cancelled';

export interface AdminPlayerAccount {
  readonly id: string;
  readonly status: PlayerAccountStatus;
  readonly displayName: string | null;
  readonly identities: {
    readonly email: { readonly linked: boolean; readonly email: string | null; readonly verified: boolean };
    readonly steam: { readonly linked: boolean; readonly steamid64: string | null };
  };
  readonly profile: {
    readonly exists: boolean;
    readonly displayName: string | null;
    readonly slug: string | null;
    readonly visibility: PlayerProfileVisibility | null;
    readonly avatarUrl: string | null;
  };
  readonly membership: {
    readonly exists: boolean;
    readonly status: PlayerMembershipStatus | null;
    readonly planCode: string | null;
    readonly startedAt: string | null;
    readonly expiresAt: string | null;
  };
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly disabledAt: string | null;
}

export interface UpdatePlayerAccountStatusCommand {
  readonly status: PlayerAccountStatus;
}
