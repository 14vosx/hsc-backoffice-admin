import { HttpErrorResponse } from '@angular/common/http';

import { SeasonsAdminContractError } from '../data-access/seasons-admin.contract';

const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  invalid_slug: 'Slug inválido.',
  missing_name: 'Nome da season é obrigatório.',
  missing_datetime: 'Datas de início e fim são obrigatórias.',
  datetime_must_be_utc_z: 'Datas devem ser enviadas em UTC.',
  start_must_be_before_end: 'A data de início deve ser anterior à data de fim.',
  season_not_found: 'A season solicitada não foi encontrada.',
  slug_already_exists: 'Já existe uma season com este slug.',
  season_date_overlap: 'Já existe uma season cadastrada para esse período. Ajuste as datas para evitar sobreposição.',
  season_closed: 'Seasons fechadas não podem ser alteradas.',
  season_already_active: 'Esta season já está ativa.',
  no_active_season: 'Não há season ativa para encerrar.',
};

export function mapSeasonsErrorMessage(error: unknown): string {
  if (error instanceof SeasonsAdminContractError) return 'A resposta do servidor de seasons é inválida.';
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) return 'Sessão administrativa inválida ou expirada.';
    if (error.status === 403) return 'Você não tem permissão para acessar temporadas.';
    const code = readErrorCode(error.error);
    if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  }
  return 'Não foi possível concluir a operação com seasons. Tente novamente.';
}

function readErrorCode(value: unknown): string | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const code = (value as Record<string, unknown>)['error'];
  return typeof code === 'string' ? code : null;
}
