import Joi from 'joi';
import { baseRequestSchema } from '../../../../shared/network/requests/i-client-request';
import { IReadyRequest } from '../../../../shared/network/requests/i-ready';
import { GamePhase } from '../../game';
import { Client } from '../client';

/**
 * Handles a ready request from the client
 *
 * @param  client       Client that made the request
 * @param  readyRequest Request object to handle
 */
export function handleReadyRequest(client: Client, readyRequest: IReadyRequest): void {

    // If game has already started, ignore request
    if (client.game.gamePhase === GamePhase.Started)
        return;

    // If player is trying to ready and is not part of a team, ignore request
    if (client.team === undefined && readyRequest.value)
        return;

    // If value did not change, ignore request
    if (client.ready === readyRequest.value)
        return;

    // Update player readiness
    client.ready = readyRequest.value;

    // Broadcast ready event to all other clients
    for (const existingClient of client.game.clients) {
        existingClient.sendEvent({
            event: 'playerReady',
            playerIdentity: client.identity,
            ready: client.ready
        });
    }

    // Attempt to start the game
    client.game.attemptGameStart();
}

/**
 * Schema for validating request JSON
 */
export const readyRequestSchema = baseRequestSchema.keys({
    request: 'ready',
    value: Joi.boolean().required()
});