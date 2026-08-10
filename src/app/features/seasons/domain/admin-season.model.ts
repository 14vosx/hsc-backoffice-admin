export const ADMIN_SEASON_STATUSES = ['draft', 'active', 'closed'] as const;

export type AdminSeasonStatus = (typeof ADMIN_SEASON_STATUSES)[number];

export type AdminSeason = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  startAt: string;
  endAt: string;
  status: AdminSeasonStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateAdminSeasonCommand = {
  slug: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  startAt: string;
  endAt: string;
};

export type UpdateAdminSeasonCommand = Omit<CreateAdminSeasonCommand, 'slug'>;

export type AdminSeasonCreateResult = {
  id: number;
  slug: string;
  status: AdminSeasonStatus;
};

export type AdminSeasonUpdateResult = {
  slug: string;
};

export type AdminSeasonLifecycleResult = {
  slug: string;
  status: AdminSeasonStatus;
};
