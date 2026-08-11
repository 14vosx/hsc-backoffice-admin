import { HttpErrorResponse } from '@angular/common/http';

const messages: Readonly<Record<string, string>> = {
  membership_not_found: 'Associação não encontrada.',
  player_account_not_found: 'Conta de jogador não encontrada.',
  missing_plan_code: 'Informe o plano da associação.',
  plan_code_too_long: 'O plano deve ter no máximo 64 caracteres.',
  invalid_expires_at: 'Informe uma data de expiração válida.',
  expires_at_must_be_utc_z: 'A expiração deve ser uma data UTC válida.',
  membership_already_exists: 'Esta conta já possui uma associação. Os dados serão atualizados.',
  membership_already_active: 'A associação já está ativa. Os dados serão atualizados.',
  membership_already_suspended: 'A associação já está suspensa. Os dados serão atualizados.',
  membership_already_cancelled: 'A associação já está cancelada. Os dados serão atualizados.',
  membership_not_inactive: 'A associação não está inativa. Os dados serão atualizados.',
  membership_not_active: 'A associação não está ativa. Os dados serão atualizados.',
  membership_not_suspended: 'A associação não está suspensa. Os dados serão atualizados.',
  membership_not_cancellable: 'A associação não pode mais ser cancelada. Os dados serão atualizados.',
  membership_expired: 'A associação expirou e não pode ser alterada. Os dados serão atualizados.',
  membership_cancelled: 'A associação foi cancelada e não pode ser alterada. Os dados serão atualizados.',
  membership_transition_failed: 'O estado da associação mudou durante a operação. Os dados serão atualizados.',
  db_not_ready: 'Serviço de dados temporariamente indisponível.',
};

const concurrentCodes = new Set([
  'membership_already_exists', 'membership_already_active', 'membership_already_suspended', 'membership_already_cancelled',
  'membership_not_inactive', 'membership_not_active', 'membership_not_suspended', 'membership_not_cancellable',
  'membership_expired', 'membership_cancelled', 'membership_transition_failed',
]);

export function membershipErrorMessage(error: unknown, operation: 'read' | 'grant' | 'lifecycle'): string {
  const code = membershipErrorCode(error);
  if (code && messages[code]) return messages[code];
  if (operation === 'read') return 'Não foi possível carregar a associação.';
  if (operation === 'grant') return 'Não foi possível conceder a associação.';
  return 'Não foi possível alterar a associação.';
}

export function isMembershipNotFound(error: unknown): boolean { return membershipErrorCode(error) === 'membership_not_found'; }
export function isMembershipConcurrentError(error: unknown): boolean {
  const code = membershipErrorCode(error);
  return code !== null && concurrentCodes.has(code);
}

function membershipErrorCode(error: unknown): string | null {
  return error instanceof HttpErrorResponse && isRecord(error.error) && typeof error.error['error'] === 'string' ? error.error['error'] : null;
}
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
