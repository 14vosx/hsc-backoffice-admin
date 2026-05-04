import {
  AdminSeasonListItem,
  CreateSeasonPayload,
  SeasonFormValue,
  UpdateSeasonPayload,
} from '../data-access/seasons-admin.models';

function clean(value: string): string {
  return value.trim();
}

export function toSeasonFormValue(
  value?: Partial<SeasonFormValue> | null,
): SeasonFormValue {
  return {
    slug: clean(value?.slug ?? ''),
    name: clean(value?.name ?? ''),
    description: clean(value?.description ?? ''),
    startDate: value?.startDate ?? null,
    startTime: clean(value?.startTime ?? ''),
    endDate: value?.endDate ?? null,
    endTime: clean(value?.endTime ?? ''),
  };
}

export function toCreateSeasonPayload(value: SeasonFormValue): CreateSeasonPayload {
  const normalized = toSeasonFormValue(value);

  return {
    slug: normalized.slug,
    name: normalized.name,
    description: normalized.description || null,
    start_at: localDateAndTimeToUtcIso(normalized.startDate, normalized.startTime),
    end_at: localDateAndTimeToUtcIso(normalized.endDate, normalized.endTime),
  };
}

export function toUpdateSeasonPayload(value: SeasonFormValue): UpdateSeasonPayload {
  const normalized = toSeasonFormValue(value);

  return {
    name: normalized.name,
    description: normalized.description || null,
    start_at: localDateAndTimeToUtcIso(normalized.startDate, normalized.startTime),
    end_at: localDateAndTimeToUtcIso(normalized.endDate, normalized.endTime),
  };
}

export function seasonItemToFormValue(item: AdminSeasonListItem): SeasonFormValue {
  const start = utcIsoToLocalDateAndTime(item.start_at);
  const end = utcIsoToLocalDateAndTime(item.end_at);

  return {
    slug: item.slug,
    name: item.name,
    description: item.description ?? '',
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
  };
}

export function localDateAndTimeToUtcIso(date: Date | null, time: string): string {
  if (!date || !isValidLocalTime(time)) {
    throw new Error('invalid_datetime');
  }

  const [hours, minutes] = time.split(':').map(Number);
  const localDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
  );

  return localDate.toISOString();
}

export function isValidLocalTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function utcIsoToLocalDateAndTime(value: string): { date: Date | null; time: string } {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { date: null, time: '' };
  }

  return {
    date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    time: `${padTime(date.getHours())}:${padTime(date.getMinutes())}`,
  };
}

function padTime(value: number): string {
  return value.toString().padStart(2, '0');
}
