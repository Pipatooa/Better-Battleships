import Joi                            from 'joi';
import { baseRequestSchema }          from 'shared/network/requests/i-client-request';
import { Rotation }                   from '../../../../shared/scenario/objects/common/rotation';
import { GamePhase }                  from '../../game';
import type { Ship }                  from '../../scenario/objects/ship';
import type { Client }                from '../client';
import type { IShipPlacementRequest } from 'shared/network/requests/i-ship-placement';

/**
 * Handles a ship placement request from the client
 *
 * @param  client               Client that made the request
 * @param  shipPlacementRequest Request object to handle
 */
export async function handleShipPlacementRequest(client: Client, shipPlacementRequest: IShipPlacementRequest): Promise<void> {

    if (client.shipsPlaced || client.game.gamePhase !== GamePhase.Setup)
        return;

    // Check that ship data provided matches the number of ships for the player
    if (shipPlacementRequest.shipPlacements.length !== client.player!.ships.length) {
        client.ws.close(1002, 'Ship placement data did not match number of ships that the player has');
        return;
    }

    // Place player's ships onto the board
    const shipsPlaced: Ship[] = [];
    for (let i = 0; i < shipPlacementRequest.shipPlacements.length; i++) {
        const [x, y, rotation] = shipPlacementRequest.shipPlacements[i];
        const ship = client.player!.ships[i];
        const region = client.game.scenario.board.regions[client.player!.spawnRegionID];
        const placementOK = client.game.scenario.board.checkPlacement(ship!, rotation, x, y, region);

        // Undo ship placements if any placement is invalid
        if (!placementOK) {
            for (const placedShip of shipsPlaced) {
                client.game.scenario.board.removeShip(placedShip);
            }
            return;
        }

        ship!.place(x, y);
        shipsPlaced.push(ship!);
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
        Joi.array().items(Joi.number(), Joi.number(), Joi.number().valid(Rotation.NoChange, Rotation.Clockwise90, Rotation.Clockwise180, Rotation.Clockwise270)).required()
    ).required()
});
