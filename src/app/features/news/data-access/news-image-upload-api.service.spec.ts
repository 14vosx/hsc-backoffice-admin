import { describe, expect, it } from 'vitest';

import { NewsImageUploadContractError, parseNewsImageUploadResult } from './news-image-upload-api.service';

describe('News image upload contract', () => {
  it('returns only the validated application result', () => {
    expect(parseNewsImageUploadResult({ ok: true, url: '/news/image.webp' })).toEqual({ url: '/news/image.webp' });
  });

  it('rejects an invalid upload response', () => {
    expect(() => parseNewsImageUploadResult({ ok: true, url: 42 })).toThrow(NewsImageUploadContractError);
  });
});
