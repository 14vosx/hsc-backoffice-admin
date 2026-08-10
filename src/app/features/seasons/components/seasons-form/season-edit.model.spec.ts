import { describe, expect, it } from 'vitest';

import type { AdminSeason } from '../../domain/admin-season.model';
import {
  buildCreateSeasonCommand,
  buildUpdateSeasonCommand,
  createSeasonEditModel,
  hasValidSeasonRange,
  localDateTimeToUtcIso,
} from './season-edit.model';

const season: AdminSeason = {
  id: 1,
  slug: 'season-one',
  name: 'Season One',
  description: null,
  coverImageUrl: null,
  startAt: '2026-01-10T12:30:00.000Z',
  endAt: '2026-02-10T12:30:00.000Z',
  status: 'draft',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('season edit model', () => {
  it('maps UTC instants to local date and time strings', () => {
    const model = createSeasonEditModel(season);
    const expected = new Date(season.startAt);
    expect(model.startDate).toBe(`${expected.getFullYear()}-${pad(expected.getMonth() + 1)}-${pad(expected.getDate())}`);
    expect(model.startTime).toBe(`${pad(expected.getHours())}:${pad(expected.getMinutes())}`);
  });

  it('converts explicit local date and time to the corresponding UTC instant', () => {
    expect(localDateTimeToUtcIso('2026-03-15', '09:45')).toBe(new Date(2026, 2, 15, 9, 45).toISOString());
  });

  it('rejects impossible dates and inverted ranges', () => {
    expect(localDateTimeToUtcIso('2026-02-30', '10:00')).toBeNull();
    expect(localDateTimeToUtcIso('2026-02-20', '24:00')).toBeNull();
    expect(hasValidSeasonRange({ ...createSeasonEditModel(), startDate: '2026-03-02', startTime: '10:00', endDate: '2026-03-02', endTime: '10:00' })).toBe(false);
    expect(hasValidSeasonRange({ ...createSeasonEditModel(), startDate: '2026-03-02', startTime: '10:00', endDate: '2026-03-02', endTime: '09:59' })).toBe(false);
  });

  it('builds clean create and update domain commands', () => {
    const model = { ...createSeasonEditModel(), slug: ' season-two ', name: ' Season Two ', description: ' ', startDate: '2026-03-01', startTime: '10:00', endDate: '2026-03-02', endTime: '10:00' };
    expect(buildCreateSeasonCommand(model)).toMatchObject({ slug: 'season-two', name: 'Season Two', description: null });
    expect(buildUpdateSeasonCommand(model)).not.toHaveProperty('slug');
  });
});

function pad(value: number): string { return value.toString().padStart(2, '0'); }
