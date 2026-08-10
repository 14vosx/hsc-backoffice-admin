import { describe, expect, it } from 'vitest';

import { parseSeasonDetail, parseSeasonList, SeasonsAdminContractError, toCreateSeasonPayload } from './seasons-admin.contract';

const wireItem = {
  id: 7,
  slug: 'season-seven',
  name: 'Season Seven',
  description: null,
  cover_image_url: null,
  start_at: '2026-01-01T00:00:00.000Z',
  end_at: '2026-02-01T00:00:00.000Z',
  status: 'draft',
  created_at: '2025-12-01T00:00:00.000Z',
  updated_at: '2025-12-02T00:00:00.000Z',
};

describe('Seasons admin contract', () => {
  it('normalizes list and detail responses to domain camelCase', () => {
    expect(parseSeasonList({ ok: true, count: 1, items: [wireItem] })[0]).toMatchObject({ coverImageUrl: null, startAt: wireItem.start_at, updatedAt: wireItem.updated_at });
    expect(parseSeasonDetail({ ok: true, item: wireItem }).slug).toBe('season-seven');
  });

  it('rejects unknown statuses and malformed responses', () => {
    expect(() => parseSeasonDetail({ ok: true, item: { ...wireItem, status: 'surprise' } })).toThrow(SeasonsAdminContractError);
    expect(() => parseSeasonList({ ok: true, items: null })).toThrow(SeasonsAdminContractError);
  });

  it('maps domain commands to wire payloads only at the boundary', () => {
    expect(toCreateSeasonPayload({ slug: 's', name: 'S', description: null, coverImageUrl: '/cover.webp', startAt: 'start', endAt: 'end' })).toEqual({ slug: 's', name: 'S', description: null, cover_image_url: '/cover.webp', start_at: 'start', end_at: 'end' });
  });
});
