import Joi from 'joi';
import { baseRequestSchema } from '../../../../shared/network/requests/i-client-request';
import { IShipPlacementRequest } from '../../../../shared/network/requests/i-ship-placement-request';
import { Client } from '../client';

/**
 * Handles a ship placement request from the client
 *
 * @param  client               Client that made the request
 * @param  shipPlacementRequest Request object to handle
 */
export function handleShipPlacementRequest(client: Client, shipPlacementRequest: IShipPlacementRequest): void {

    // Check that ship data provided matches the number of ships for the player
    if (shipPlacementRequest.shipPlacements.length !== client.player!.ships.length) {
        client.ws.close(1002, 'Ship placement data did not match number of ships that the player has');
        return;
    }

    // Update coordinates of the player's ships
    for (let i = 0; i < shipPlacementRequest.shipPlacements.length; i++) {
        const [x, y] = shipPlacementRequest.shipPlacements[i];
        const ship = client.player!.ships[i];
        ship.x = x;
        ship.y = y;
    }

    client.shipsPlaced = true;
    client.game.attemptGameStart();
}

/**
 * Schema for validating request JSON
 */
export const shipPlacementRequestSchema = baseRequestSchema.keys({
    request: 'shipPlacement',
    shipPlacements: Joi.array().items(
        Joi.array().items(Joi.number()).length(2).required()
    ).required()
});