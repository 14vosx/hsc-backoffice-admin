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

export type SeasonFormValue = {
  slug: string;
  name: string;
  description: string;
  startDate: Date | null;
  startTime: string;
  endDate: Date | null;
  endTime: string;
};

export type CreateSeasonPayload = {
  slug: string;
  name: string;
  description: string | null;
  start_at: string;
  end_at: string;
};

export type CreateSeasonResponse = {
  ok: true;
  id: number;
  slug: string;
  status: 'draft' | string;
};
