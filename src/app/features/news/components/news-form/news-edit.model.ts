import type { AdminNewsDetail, CreateAdminNewsCommand, UpdateAdminNewsCommand } from '../../domain/admin-news.model';

export type NewsEditModel = { slug: string; title: string; content: string; imageUrl: string };

function optionalUrl(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}

export function createNewsEditModel(news?: AdminNewsDetail | null): NewsEditModel {
  return { slug: news?.slug ?? '', title: news?.title ?? '', content: news?.content ?? '', imageUrl: news?.imageUrl ?? '' };
}

export function buildCreateAdminNewsCommand(model: NewsEditModel): CreateAdminNewsCommand {
  return { slug: model.slug.trim(), title: model.title.trim(), content: model.content, imageUrl: optionalUrl(model.imageUrl) };
}

export function buildUpdateAdminNewsCommand(model: NewsEditModel): UpdateAdminNewsCommand {
  return { title: model.title.trim(), content: model.content, imageUrl: optionalUrl(model.imageUrl) };
}
