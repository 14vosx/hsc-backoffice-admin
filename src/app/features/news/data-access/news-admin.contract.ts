import type {
  AdminNews,
  AdminNewsCreateResult,
  AdminNewsDeleteResult,
  AdminNewsDetail,
  AdminNewsStatus,
  CreateAdminNewsCommand,
  UpdateAdminNewsCommand,
} from '../domain/admin-news.model';

export class NewsAdminContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NewsAdminContractError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function record(value: unknown, context: string): Record<string, unknown> {
  if (!isRecord(value)) throw new NewsAdminContractError(`${context} inválido.`);
  return value;
}

function stringField(value: Record<string, unknown>, field: string): string {
  const result = value[field];
  if (typeof result !== 'string') throw new NewsAdminContractError(`Campo ${field} inválido.`);
  return result;
}

function nullableStringField(value: Record<string, unknown>, field: string): string | null {
  const result = value[field];
  if (result !== null && typeof result !== 'string') throw new NewsAdminContractError(`Campo ${field} inválido.`);
  return result;
}

function numberField(value: Record<string, unknown>, field: string): number {
  const result = value[field];
  if (typeof result !== 'number' || !Number.isFinite(result)) throw new NewsAdminContractError(`Campo ${field} inválido.`);
  return result;
}

function statusField(value: Record<string, unknown>): AdminNewsStatus {
  const status = value['status'];
  if (status !== 'draft' && status !== 'published') throw new NewsAdminContractError('Status de news inválido.');
  return status;
}

function parseNews(value: unknown): AdminNews {
  const item = record(value, 'News');
  return {
    id: numberField(item, 'id'),
    slug: stringField(item, 'slug'),
    title: stringField(item, 'title'),
    excerpt: nullableStringField(item, 'excerpt'),
    imageUrl: nullableStringField(item, 'image_url'),
    status: statusField(item),
    publishedAt: nullableStringField(item, 'published_at'),
    createdAt: stringField(item, 'created_at'),
    updatedAt: stringField(item, 'updated_at'),
  };
}

export function parseAdminNewsList(value: unknown): AdminNews[] {
  const envelope = record(value, 'Resposta de listagem');
  if (envelope['ok'] !== true || !Array.isArray(envelope['items'])) throw new NewsAdminContractError('Resposta de listagem inválida.');
  numberField(envelope, 'count');
  return envelope['items'].map(parseNews);
}

export function parseAdminNewsDetail(value: unknown): AdminNewsDetail {
  const envelope = record(value, 'Resposta de detalhe');
  if (envelope['ok'] !== true) throw new NewsAdminContractError('Resposta de detalhe inválida.');
  const item = record(envelope['item'], 'Detalhe de news');
  return { ...parseNews(item), content: stringField(item, 'content') };
}

export function parseAdminNewsMutation(value: unknown): AdminNews {
  const envelope = record(value, 'Resposta de mutação');
  if (envelope['ok'] !== true) throw new NewsAdminContractError('Resposta de mutação inválida.');
  return parseNews(envelope['item']);
}

export function parseAdminNewsCreate(value: unknown): AdminNewsCreateResult {
  const envelope = record(value, 'Resposta de criação');
  if (envelope['ok'] !== true) throw new NewsAdminContractError('Resposta de criação inválida.');
  return { id: numberField(envelope, 'id'), slug: stringField(envelope, 'slug'), status: statusField(envelope) };
}

export function parseAdminNewsDelete(value: unknown): AdminNewsDeleteResult {
  const envelope = record(value, 'Resposta de remoção');
  if (envelope['ok'] !== true) throw new NewsAdminContractError('Resposta de remoção inválida.');
  return { deleted: numberField(envelope, 'deleted') };
}

export function toCreateAdminNewsWire(command: CreateAdminNewsCommand): Record<string, string | null> {
  return { slug: command.slug, title: command.title, content: command.content, image_url: command.imageUrl };
}

export function toUpdateAdminNewsWire(command: UpdateAdminNewsCommand): Record<string, string | null> {
  return { title: command.title, content: command.content, image_url: command.imageUrl };
}
