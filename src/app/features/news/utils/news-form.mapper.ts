import {
  AdminNewsDetail,
  AdminNewsEditableDraft,
  AdminNewsListItem,
  CreateNewsPayload,
  NewsFormValue,
  UpdateNewsPayload,
} from '../data-access/news-admin.models';

function clean(value: string): string {
  return value.trim();
}

function cleanOptionalUrl(value: string | null | undefined): string | null {
  const normalized = clean(value ?? '');
  return normalized ? normalized : null;
}

export function toNewsFormValue(value?: Partial<NewsFormValue> | null): NewsFormValue {
  return {
    slug: clean(value?.slug ?? ''),
    title: clean(value?.title ?? ''),
    content: value?.content ?? '',
    image_url: cleanOptionalUrl(value?.image_url),
  };
}

export function toCreateNewsPayload(value: NewsFormValue): CreateNewsPayload {
  const normalized = toNewsFormValue(value);

  return {
    slug: normalized.slug,
    title: normalized.title,
    content: normalized.content,
    image_url: normalized.image_url,
  };
}

export function toUpdateNewsPayload(
  value: Pick<NewsFormValue, 'title' | 'content' | 'image_url'>,
): UpdateNewsPayload {
  const normalized = toNewsFormValue(value);

  return {
    title: normalized.title,
    content: normalized.content,
    image_url: normalized.image_url,
  };
}

export function createEditableDraftFromCreate(
  id: number,
  value: NewsFormValue,
): AdminNewsEditableDraft {
  const normalized = toNewsFormValue(value);

  return {
    id,
    slug: normalized.slug,
    title: normalized.title,
    content: normalized.content,
    image_url: normalized.image_url,
    status: 'draft',
    published_at: null,
    created_at: null,
    updated_at: null,
  };
}

export function createEditableDraftFromDetail(
  detail: AdminNewsDetail,
): AdminNewsEditableDraft {
  return {
    id: detail.id,
    slug: detail.slug,
    title: detail.title,
    content: detail.content,
    image_url: cleanOptionalUrl(detail.image_url),
    status: detail.status,
    published_at: detail.published_at,
    created_at: detail.created_at,
    updated_at: detail.updated_at,
  };
}

export function mergeEditableDraftWithItem(
  draft: AdminNewsEditableDraft,
  item: AdminNewsListItem,
): AdminNewsEditableDraft {
  return {
    ...draft,
    id: item.id,
    slug: item.slug,
    title: item.title,
    image_url: cleanOptionalUrl(item.image_url),
    status: item.status,
    published_at: item.published_at,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}
