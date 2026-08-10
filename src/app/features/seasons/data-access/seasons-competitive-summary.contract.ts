import { ADMIN_SEASON_STATUSES, type AdminSeasonStatus } from '../domain/admin-season.model';
import type {
  SeasonCompetitiveDetail,
  SeasonCompetitiveIndexItem,
  SeasonCompetitiveInfo,
  SeasonCompetitiveSummary,
  SeasonsCompetitiveIndex,
} from '../domain/season-competitive.model';
import { SeasonsAdminContractError } from './seasons-admin.contract';

export function parseSeasonsCompetitiveIndex(value: unknown): SeasonsCompetitiveIndex {
  const record = asRecord(value, 'índice competitivo');
  if (!Array.isArray(record['seasons'])) throw invalid('seasons');
  return {
    generatedAt: asTimestamp(record['generatedAt'], 'generatedAt'),
    activeSeasonSlug: asNullableString(record['activeSeasonSlug'], 'activeSeasonSlug'),
    seasons: record['seasons'].map(parseIndexItem),
  };
}

export function parseSeasonCompetitiveDetail(value: unknown): SeasonCompetitiveDetail {
  const record = asRecord(value, 'detalhe competitivo');
  return {
    generatedAt: asTimestamp(record['generatedAt'], 'generatedAt'),
    season: parseInfo(record['season']),
    summary: parseSummary(record['summary']),
  };
}

function parseIndexItem(value: unknown): SeasonCompetitiveIndexItem {
  const record = asRecord(value, 'season competitiva');
  return { ...parseInfo(record), summary: parseSummary(record['summary']) };
}

function parseInfo(value: unknown): SeasonCompetitiveInfo {
  const record = asRecord(value, 'season competitiva');
  return {
    slug: asString(record['slug'], 'slug'),
    name: asString(record['name'], 'name'),
    description: asNullableString(record['description'], 'description'),
    status: asStatus(record['status']),
    startAt: asTimestamp(record['start_at'], 'start_at'),
    endAt: asTimestamp(record['end_at'], 'end_at'),
  };
}

function parseSummary(value: unknown): SeasonCompetitiveSummary {
  const record = asRecord(value, 'resumo competitivo');
  return {
    matches: asNumber(record['matches'], 'matches'),
    maps: asNumber(record['maps'], 'maps'),
    rounds: asNumber(record['rounds'], 'rounds'),
    players: asNumber(record['players'], 'players'),
    lastMapEndedAt: asNullableTimestamp(record['lastMapEndedAt'], 'lastMapEndedAt'),
  };
}

function asRecord(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw invalid(field);
  return value as Record<string, unknown>;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string') throw invalid(field);
  return value;
}

function asNullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  return asString(value, field);
}

function asTimestamp(value: unknown, field: string): string {
  const timestamp = asString(value, field);
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)
    ? `${timestamp.replace(' ', 'T')}Z`
    : timestamp;
  if (Number.isNaN(Date.parse(normalized))) throw invalid(field);
  return normalized;
}

function asNullableTimestamp(value: unknown, field: string): string | null {
  return value === null ? null : asTimestamp(value, field);
}

function asNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalid(field);
  return value;
}

function asStatus(value: unknown): AdminSeasonStatus {
  if (typeof value !== 'string' || !ADMIN_SEASON_STATUSES.includes(value as AdminSeasonStatus)) throw invalid('status');
  return value as AdminSeasonStatus;
}

function invalid(field: string): SeasonsAdminContractError {
  return new SeasonsAdminContractError(`Contrato competitivo inválido: ${field}.`);
}
