import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { isConcurrentStatusError, playerAccountsErrorMessage } from './player-accounts-error.mapper';

describe('playerAccountsErrorMessage', () => {
  it.each([
    ['player_account_not_found', 'Conta de jogador não encontrada.'],
    ['db_not_ready', 'Serviço de dados temporariamente indisponível.'],
    ['player_accounts_read_failed', 'Não foi possível carregar as contas de jogadores.'],
    ['player_account_update_failed', 'Não foi possível alterar o status da conta.'],
    ['player_account_transition_failed', 'Não foi possível alterar o status da conta.'],
  ])('maps %s to pt-BR', (code, expected) => expect(playerAccountsErrorMessage(new HttpErrorResponse({ error: { error: code } }), 'update')).toBe(expected));

  it('recognizes concurrent transitions', () => expect(isConcurrentStatusError(new HttpErrorResponse({ error: { error: 'player_account_already_disabled' } }))).toBe(true));
});
