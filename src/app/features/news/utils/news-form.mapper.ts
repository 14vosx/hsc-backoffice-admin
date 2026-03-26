import {
  AdminNewsEditableDraft,
  AdminNewsListItem,
  CreateNewsPayload,
  NewsFormValue,
  UpdateNewsPayload,
} from '../data-access/news-admin.models';

function clean(value: string): string {
  return value.trim();
}

export function toNewsFormValue(value?: Partial<NewsFormValue> | null): NewsFormValue {
  return {
    slug: clean(value?.slug ?? ''),
    title: clean(value?.title ?? ''),
    content: value?.content ?? '',
  };
}

export function toCreateNewsPayload(value: NewsFormValue): CreateNewsPayload {
  const normalized = toNewsFormValue(value);

  return {
    slug: normalized.slug,
    title: normalized.title,
    content: normalized.content,
  };
}

export function toUpdateNewsPayload(value: Pick<NewsFormValue, 'title' | 'content'>): UpdateNewsPayload {
  return {
    title: clean(value.title),
    content: value.content,
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
    status: 'draft',
    published_at: null,
    created_at: null,
    updated_at: null,
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
    status: item.status,
    published_at: item.published_at,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}
