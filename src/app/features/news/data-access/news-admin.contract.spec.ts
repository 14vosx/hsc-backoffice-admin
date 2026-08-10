import { describe, expect, it } from 'vitest';

import { NewsAdminContractError, parseAdminNewsDetail, parseAdminNewsList } from './news-admin.contract';

const wireItem = {
  id: 1, slug: 'one', title: 'One', excerpt: null, content: 'Content', image_url: '/one.webp',
  status: 'draft', published_at: null, created_at: '2026-08-01T12:00:00.000Z', updated_at: '2026-08-10T15:00:00.000Z',
};

describe('News admin contract', () => {
  it('validates and maps wire fields to the domain', () => {
    expect(parseAdminNewsList({ ok: true, count: 1, items: [wireItem] })).toEqual([{
      id: 1, slug: 'one', title: 'One', excerpt: null, imageUrl: '/one.webp', status: 'draft',
      publishedAt: null, createdAt: '2026-08-01T12:00:00.000Z', updatedAt: '2026-08-10T15:00:00.000Z',
    }]);
    expect(parseAdminNewsDetail({ ok: true, item: wireItem }).content).toBe('Content');
  });

  it('rejects an unknown status', () => {
    expect(() => parseAdminNewsList({ ok: true, count: 1, items: [{ ...wireItem, status: 'archived' }] }))
      .toThrow(NewsAdminContractError);
  });
});
