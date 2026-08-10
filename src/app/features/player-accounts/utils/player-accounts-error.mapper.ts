import { HttpErrorResponse } from '@angular/common/http';

export type PlayerAccountsOperation = 'read' | 'update';

export function playerAccountsErrorMessage(error: unknown, operation: PlayerAccountsOperation): string {
  const code = error instanceof HttpErrorResponse && isRecord(error.error) ? error.error['error'] : null;
  if (code === 'player_account_not_found') return 'Conta de jogador não encontrada.';
  if (code === 'db_not_ready') return 'Serviço de dados temporariamente indisponível.';
  if (code === 'player_accounts_read_failed') return 'Não foi possível carregar as contas de jogadores.';
  if (code === 'player_account_update_failed' || code === 'player_account_transition_failed') return 'Não foi possível alterar o status da conta.';
  if (code === 'player_account_already_active' || code === 'already_active') return 'A conta já está ativa. Os dados serão atualizados.';
  if (code === 'player_account_already_disabled' || code === 'already_disabled') return 'A conta já está desativada. Os dados serão atualizados.';
  return operation === 'read' ? 'Não foi possível carregar as contas de jogadores.' : 'Não foi possível alterar o status da conta.';
}

export function isConcurrentStatusError(error: unknown): boolean {
  const code = error instanceof HttpErrorResponse && isRecord(error.error) ? error.error['error'] : null;
  return code === 'player_account_already_active' || code === 'player_account_already_disabled' || code === 'already_active' || code === 'already_disabled';
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
