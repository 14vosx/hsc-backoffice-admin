export type AdminNewsStatus = 'draft' | 'published' | string;

export type AdminNewsListItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  status: AdminNewsStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminNewsListResponse = {
  ok: true;
  count: number;
  items: AdminNewsListItem[];
};

export type NewsFormValue = {
  slug: string;
  title: string;
  content: string;
};

export type CreateNewsPayload = {
  slug: string;
  title: string;
  content: string;
};

export type UpdateNewsPayload = {
  title?: string;
  content?: string;
};

export type CreateNewsResponse = {
  ok: true;
  id: number;
  slug: string;
  status: 'draft' | string;
};

export type AdminNewsMutationResponse = {
  ok: true;
  item: AdminNewsListItem;
};

export type AdminNewsDeleteResponse = {
  ok: true;
  deleted: number;
};

export type AdminNewsEditableDraft = {
  id: number;
  slug: string;
  title: string;
  content: string;
  status: AdminNewsStatus;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};
