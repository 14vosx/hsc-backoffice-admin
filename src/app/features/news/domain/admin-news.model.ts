export type AdminNewsStatus = 'draft' | 'published';

export type AdminNews = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  status: AdminNewsStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminNewsDetail = AdminNews & {
  content: string;
};

export type CreateAdminNewsCommand = {
  slug: string;
  title: string;
  content: string;
  imageUrl: string | null;
};

export type UpdateAdminNewsCommand = Omit<CreateAdminNewsCommand, 'slug'>;

export type AdminNewsCreateResult = {
  id: number;
  slug: string;
  status: AdminNewsStatus;
};

export type AdminNewsDeleteResult = {
  deleted: number;
};
