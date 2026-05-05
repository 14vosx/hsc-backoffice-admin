import { HttpErrorResponse } from '@angular/common/http';

export function mapSeasonsErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) {
      return 'Sessão administrativa inválida ou expirada.';
    }

    if (error.status === 403) {
      return 'Você não tem permissão para acessar temporadas.';
    }

    if (error.status === 400 && error.error?.error === 'invalid_slug') {
      return 'Slug inválido.';
    }

    if (error.status === 400 && error.error?.error === 'missing_name') {
      return 'Nome da season é obrigatório.';
    }

    if (error.status === 400 && error.error?.error === 'missing_datetime') {
      return 'Datas de início e fim são obrigatórias.';
    }

    if (error.status === 400 && error.error?.error === 'datetime_must_be_utc_z') {
      return 'Datas devem ser enviadas em UTC.';
    }

    if (error.status === 400 && error.error?.error === 'start_must_be_before_end') {
      return 'A data de início deve ser anterior à data de fim.';
    }

    if (error.status === 404 && error.error?.error === 'season_not_found') {
      return 'A season solicitada não foi encontrada.';
    }

    if (error.status === 409 && error.error?.error === 'slug_already_exists') {
      return 'Já existe uma season com este slug.';
    }

    if (error.status === 409 && error.error?.error === 'season_date_overlap') {
      return 'Já existe uma season cadastrada para esse período. Ajuste as datas para evitar sobreposição.';
    }

    if (error.status === 409 && error.error?.error === 'season_closed') {
      return 'Seasons fechadas não podem ser alteradas.';
    }

    if (error.status === 409 && error.error?.error === 'season_already_active') {
      return 'Esta season já está ativa.';
    }

    if (error.status === 409 && error.error?.error === 'no_active_season') {
      return 'Não há season ativa para encerrar.';
    }

    if (typeof error.error?.error === 'string' && error.error.error.trim()) {
      return `Falha na operação: ${error.error.error}.`;
    }
  }

  return 'Falha ao carregar temporadas. Tente novamente.';
}
