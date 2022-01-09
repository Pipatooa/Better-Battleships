import { baseRequestSchema }    from 'shared/network/requests/i-client-request';
import { GamePhase }            from '../../game';
import type { Client }          from '../client';
import type { IEndTurnRequest } from 'shared/network/requests/i-end-turn';

/**
 * Handles an end turn request from the client
 *
 * @param  client         Client that made the request
 * @param  endTurnRequest Request object to handle
 */
export async function handleEndTurnRequest(client: Client, endTurnRequest: IEndTurnRequest): Promise<void> {

    if (client.game.gamePhase !== GamePhase.InProgress || client.game.scenario.turnManager.currentTurn !== client.player)
        return;

    client.game.scenario.turnManager.advanceTurn(true);
}

/**
 * Schema for validating request JSON
 */
export const endTurnRequestSchema = baseRequestSchema.keys({
    request: 'endTurn'
});
