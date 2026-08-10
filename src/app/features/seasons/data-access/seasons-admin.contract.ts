import {
  ADMIN_SEASON_STATUSES,
  type AdminSeason,
  type AdminSeasonCreateResult,
  type AdminSeasonLifecycleResult,
  type AdminSeasonStatus,
  type AdminSeasonUpdateResult,
  type CreateAdminSeasonCommand,
  type UpdateAdminSeasonCommand,
} from '../domain/admin-season.model';

export class SeasonsAdminContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SeasonsAdminContractError';
  }
}

export function parseSeasonList(value: unknown): AdminSeason[] {
  const record = asRecord(value, 'lista de seasons');
  if (record['ok'] !== true || !Array.isArray(record['items'])) {
    throw new SeasonsAdminContractError('Resposta inválida da lista de seasons.');
  }
  return record['items'].map((item) => parseSeason(item));
}

export function parseSeasonDetail(value: unknown): AdminSeason {
  const record = asRecord(value, 'detalhe da season');
  if (record['ok'] !== true) {
    throw new SeasonsAdminContractError('Resposta inválida do detalhe da season.');
  }
  return parseSeason(record['item']);
}

export function parseSeasonCreateResult(value: unknown): AdminSeasonCreateResult {
  const record = asOkRecord(value, 'criação da season');
  return {
    id: asNumber(record['id'], 'id'),
    slug: asString(record['slug'], 'slug'),
    status: asStatus(record['status']),
  };
}

export function parseSeasonUpdateResult(value: unknown): AdminSeasonUpdateResult {
  const record = asOkRecord(value, 'atualização da season');
  if (record['updated'] !== true) {
    throw new SeasonsAdminContractError('Resposta inválida da atualização da season.');
  }
  return { slug: asString(record['slug'], 'slug') };
}

export function parseSeasonLifecycleResult(value: unknown): AdminSeasonLifecycleResult {
  const record = asOkRecord(value, 'mudança de status da season');
  return {
    slug: asString(record['slug'], 'slug'),
    status: asStatus(record['status']),
  };
}

export function toCreateSeasonPayload(command: CreateAdminSeasonCommand): Record<string, unknown> {
  return toSeasonPayload(command, true);
}

export function toUpdateSeasonPayload(command: UpdateAdminSeasonCommand): Record<string, unknown> {
  return toSeasonPayload(command, false);
}

function parseSeason(value: unknown): AdminSeason {
  const record = asRecord(value, 'season');
  return {
    id: asNumber(record['id'], 'id'),
    slug: asString(record['slug'], 'slug'),
    name: asString(record['name'], 'name'),
    description: asNullableString(record['description'], 'description'),
    coverImageUrl: asNullableString(record['cover_image_url'], 'cover_image_url'),
    startAt: asTimestamp(record['start_at'], 'start_at'),
    endAt: asTimestamp(record['end_at'], 'end_at'),
    status: asStatus(record['status']),
    createdAt: asTimestamp(record['created_at'], 'created_at'),
    updatedAt: asTimestamp(record['updated_at'], 'updated_at'),
  };
}

function toSeasonPayload(
  command: CreateAdminSeasonCommand | UpdateAdminSeasonCommand,
  includeSlug: boolean,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: command.name,
    description: command.description,
    cover_image_url: command.coverImageUrl,
    start_at: command.startAt,
    end_at: command.endAt,
  };
  if (includeSlug && 'slug' in command) payload['slug'] = command.slug;
  return payload;
}

function asOkRecord(value: unknown, label: string): Record<string, unknown> {
  const record = asRecord(value, label);
  if (record['ok'] !== true) throw new SeasonsAdminContractError(`Resposta inválida de ${label}.`);
  return record;
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new SeasonsAdminContractError(`Contrato inválido para ${label}.`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new SeasonsAdminContractError(`Campo inválido: ${field}.`);
  return value;
}

function asNullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  return asString(value, field);
}

function asNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new SeasonsAdminContractError(`Campo inválido: ${field}.`);
  }
  return value;
}

function asTimestamp(value: unknown, field: string): string {
  const timestamp = asString(value, field);
  if (Number.isNaN(Date.parse(timestamp))) {
    throw new SeasonsAdminContractError(`Timestamp inválido: ${field}.`);
  }
  return timestamp;
}

function asStatus(value: unknown): AdminSeasonStatus {
  if (typeof value !== 'string' || !ADMIN_SEASON_STATUSES.includes(value as AdminSeasonStatus)) {
    throw new SeasonsAdminContractError('Status de season inválido.');
  }
  return value as AdminSeasonStatus;
}
