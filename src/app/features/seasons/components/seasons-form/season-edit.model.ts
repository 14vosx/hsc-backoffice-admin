import type {
  AdminSeason,
  CreateAdminSeasonCommand,
  UpdateAdminSeasonCommand,
} from '../../domain/admin-season.model';

export type SeasonEditModel = {
  slug: string;
  name: string;
  description: string;
  coverImageUrl: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

export function createSeasonEditModel(item?: AdminSeason | null): SeasonEditModel {
  const start = toLocalParts(item?.startAt);
  const end = toLocalParts(item?.endAt);
  return {
    slug: item?.slug.trim() ?? '',
    name: item?.name.trim() ?? '',
    description: item?.description?.trim() ?? '',
    coverImageUrl: item?.coverImageUrl?.trim() ?? '',
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
  };
}

export function buildCreateSeasonCommand(model: SeasonEditModel): CreateAdminSeasonCommand | null {
  const common = buildCommonCommand(model);
  const slug = model.slug.trim();
  return slug && common ? { slug, ...common } : null;
}

export function buildUpdateSeasonCommand(model: SeasonEditModel): UpdateAdminSeasonCommand | null {
  return buildCommonCommand(model);
}

export function hasValidSeasonRange(model: SeasonEditModel): boolean {
  const start = localDateTimeToDate(model.startDate, model.startTime);
  const end = localDateTimeToDate(model.endDate, model.endTime);
  return start !== null && end !== null && start.getTime() < end.getTime();
}

export function localDateTimeToUtcIso(date: string, time: string): string | null {
  return localDateTimeToDate(date, time)?.toISOString() ?? null;
}

function buildCommonCommand(model: SeasonEditModel): UpdateAdminSeasonCommand | null {
  const name = model.name.trim();
  const startAt = localDateTimeToUtcIso(model.startDate, model.startTime);
  const endAt = localDateTimeToUtcIso(model.endDate, model.endTime);
  if (!name || !startAt || !endAt || new Date(startAt).getTime() >= new Date(endAt).getTime()) return null;
  return {
    name,
    description: model.description.trim() || null,
    coverImageUrl: model.coverImageUrl.trim() || null,
    startAt,
    endAt,
  };
}

function localDateTimeToDate(date: string, time: string): Date | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time.trim());
  if (!dateMatch || !timeMatch) return null;
  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const value = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (
    value.getFullYear() !== year || value.getMonth() !== month - 1 || value.getDate() !== day ||
    value.getHours() !== hours || value.getMinutes() !== minutes
  ) return null;
  return value;
}

function toLocalParts(value?: string): { date: string; time: string } {
  if (!value) return { date: '', time: '' };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { date: '', time: '' };
  return {
    date: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`,
    time: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`,
  };
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}
