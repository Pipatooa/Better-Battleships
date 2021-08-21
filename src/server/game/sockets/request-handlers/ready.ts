import Joi from 'joi';
import {baseRequestSchema} from '../../../../shared/network/requests/i-client-request';
import {IReadyRequest} from '../../../../shared/network/requests/i-ready';
import {Client} from '../client';

export function handleReadyRequest(client: Client, readyRequest: IReadyRequest) {

    // If game has already started, ignore request
    if (client.game.started)
        return;

    // If value did not change, ignore request
    if (client.ready === readyRequest.value)
        return;

    // Update player readiness
    client.ready = readyRequest.value;

    let allReady: boolean = true;

    // Broadcast ready event
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

    if (allReady) {
        client.game.startGame();
    }
}

export const readyRequestSchema = baseRequestSchema.keys({
    request: 'ready',
    value: Joi.boolean().required()
})