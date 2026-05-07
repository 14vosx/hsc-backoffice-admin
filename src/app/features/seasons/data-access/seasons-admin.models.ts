export type AdminSeasonStatus = 'draft' | 'active' | 'closed' | string;

export type AdminSeasonListItem = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
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

export type AdminSeasonDetailResponse = {
  ok: true;
  item: AdminSeasonListItem;
};

export type SeasonFormValue = {
  slug: string;
  name: string;
  description: string;
  cover_image_url: string | null;
  startDate: Date | null;
  startTime: string;
  endDate: Date | null;
  endTime: string;
};

export type CreateSeasonPayload = {
  slug: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  start_at: string;
  end_at: string;
};

export type UpdateSeasonPayload = {
  name?: string;
  description?: string | null;
  cover_image_url?: string | null;
  start_at?: string;
  end_at?: string;
};

export type CreateSeasonResponse = {
  ok: true;
  id: number;
  slug: string;
  status: 'draft' | string;
};

export type AdminSeasonUpdateResponse = {
  ok: true;
  slug: string;
  updated: true;
};

export type AdminSeasonLifecycleResponse = {
  ok: true;
  slug: string;
  status: 'active' | 'closed' | string;
};

export type AdminSeasonImageUploadResponse = {
  ok: true;
  url: string;
  path: string;
  filename: string;
  size: number;
  mimetype: string;
};
