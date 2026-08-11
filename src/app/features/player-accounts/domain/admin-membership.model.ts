export type AdminMembershipStatus = 'inactive' | 'active' | 'suspended' | 'expired' | 'cancelled';
export type AdminMembershipSource = 'manual' | 'staff' | 'promotion' | 'subscription';
export type AdminMembershipLifecycleAction = 'activate' | 'suspend' | 'reactivate' | 'cancel';

export interface AdminMembership {
  readonly id: string;
  readonly playerAccountId: string;
  readonly status: AdminMembershipStatus;
  readonly planCode: string;
  readonly source: AdminMembershipSource;
  readonly startedAt: string | null;
  readonly expiresAt: string | null;
  readonly suspendedAt: string | null;
  readonly cancelledAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface GrantAdminMembershipCommand {
  readonly playerAccountId: string;
  readonly planCode: string;
  readonly expiresAt: string | null;
}
