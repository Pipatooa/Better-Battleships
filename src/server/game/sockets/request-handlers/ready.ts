import Joi from 'joi';
import {baseRequestSchema} from '../../../../shared/network/requests/i-client-request';
import {IReadyRequest} from '../../../../shared/network/requests/i-ready';
import {Client} from '../client';

/**
 * Handles a ready request from the client
 * @param client Client that made the request
 * @param readyRequest Request object to handle
 */
export function handleReadyRequest(client: Client, readyRequest: IReadyRequest) {

    // If game has already started, ignore request
    if (client.game.started)
        return;

    // If value did not change, ignore request
    if (client.ready === readyRequest.value)
        return;

    // Update player readiness
    client.ready = readyRequest.value;

    // Flag for checking whether all players are ready
    let allReady: boolean = true;

    // Broadcast ready event to all other clients
    for (let existingClient of client.game.clients) {
        existingClient.sendEvent({
            event: 'playerReady',
            playerIdentity: client.identity,
            ready: client.ready
        });

        // If client is not ready, set all ready flag to false
        if (allReady && !existingClient.ready)
            allReady = false;
    }

    // Start game if all players are ready
    if (allReady)
        client.game.startGame();
}

/**
 * Schema for validating request JSON
 */
export const readyRequestSchema = baseRequestSchema.keys({
    request: 'ready',
    value: Joi.boolean().required()
});