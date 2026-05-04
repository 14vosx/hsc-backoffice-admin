import { HttpErrorResponse } from '@angular/common/http';

export function mapSeasonsErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) {
      return 'Sessão administrativa inválida ou expirada.';
    }

    if (error.status === 403) {
      return 'Você não tem permissão para acessar temporadas.';
    }

    if (typeof error.error?.error === 'string' && error.error.error.trim()) {
      return `Falha na operação: ${error.error.error}.`;
    }
  }

  return 'Falha ao carregar temporadas. Tente novamente.';
}
