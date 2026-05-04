export type AdminSeasonStatus = 'draft' | 'active' | 'closed' | string;

export type AdminSeasonListItem = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  start_at: string;
  end_at: string;
  status: AdminSeasonStatus;
  created_at: string;
  updated_at: string;
};

export type AdminSeasonListResponse = {
  ok: true;
  count: number;
  items: AdminSeasonListItem[];
};
