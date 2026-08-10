import { HttpErrorResponse } from '@angular/common/http';
import { NewsAdminContractError } from '../data-access/news-admin.contract';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function mapNewsErrorMessage(error: unknown): string {
  if (error instanceof NewsAdminContractError) {
    return 'A API de news retornou dados inválidos. Tente novamente mais tarde.';
  }
  if (error instanceof HttpErrorResponse) {
    const payload: unknown = error.error;
    if (error.status === 401) {
      return 'Sessão administrativa inválida ou expirada.';
    }

    if (error.status === 403) {
      return 'Você não tem permissão para executar esta ação.';
    }

    if (error.status === 400 && isRecord(payload) && payload['error'] === 'missing_fields') {
      const required = Array.isArray(payload['required'])
        ? payload['required'].filter((field): field is string => typeof field === 'string').join(', ')
        : 'slug, title, content';

      return `Campos obrigatórios ausentes: ${required}.`;
    }

    if (error.status === 404) return 'A news solicitada não foi encontrada.';
    if (error.status === 409) return 'A operação conflita com o estado atual da news.';
  }

  return 'Falha ao processar a operação de news. Tente novamente.';
}
