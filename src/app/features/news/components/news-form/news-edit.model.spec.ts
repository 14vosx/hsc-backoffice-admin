import { describe, expect, it } from 'vitest';

import type { AdminNewsDetail } from '../../domain/admin-news.model';
import { buildCreateAdminNewsCommand, buildUpdateAdminNewsCommand, createNewsEditModel } from './news-edit.model';

const detail: AdminNewsDetail = {
  id: 7, slug: 'major-final', title: 'Major Final', excerpt: 'Resumo', content: 'Conteúdo',
  imageUrl: '/news/final.webp', status: 'published', publishedAt: '2026-08-10T15:00:00.000Z',
  createdAt: '2026-08-01T12:00:00.000Z', updatedAt: '2026-08-10T15:00:00.000Z',
};

describe('NewsEditModel', () => {
  it('maps domain detail to the edit model', () => {
    expect(createNewsEditModel(detail)).toEqual({
      slug: 'major-final', title: 'Major Final', content: 'Conteúdo', imageUrl: '/news/final.webp',
    });
  });

  it('normalizes create and update commands', () => {
    const model = { slug: ' final ', title: ' Title ', content: 'Content ', imageUrl: '  ' };
    expect(buildCreateAdminNewsCommand(model)).toEqual({
      slug: 'final', title: 'Title', content: 'Content ', imageUrl: null,
    });
    expect(buildUpdateAdminNewsCommand(model)).toEqual({
      title: 'Title', content: 'Content ', imageUrl: null,
    });
  });
});
