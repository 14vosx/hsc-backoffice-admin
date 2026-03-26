import { HttpErrorResponse } from '@angular/common/http';

export function mapNewsErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) {
      return 'Sessão administrativa inválida ou expirada.';
    }

    if (error.status === 403) {
      return 'Você não tem permissão para executar esta ação.';
    }

    if (error.status === 400 && error.error?.error === 'missing_fields') {
      const required = Array.isArray(error.error?.required)
        ? error.error.required.join(', ')
        : 'slug, title, content';

      return `Campos obrigatórios ausentes: ${required}.`;
    }

    if (typeof error.error?.error === 'string' && error.error.error.trim()) {
      return `Falha na operação: ${error.error.error}.`;
    }
  }

  return 'Falha ao processar a operação de news. Tente novamente.';
}
