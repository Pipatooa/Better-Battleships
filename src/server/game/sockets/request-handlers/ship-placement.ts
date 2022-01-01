import Joi                            from 'joi';
import { baseRequestSchema }          from 'shared/network/requests/i-client-request';
import { Rotation }                   from 'shared/scenario/objects/common/rotation';
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

    // Place player's ships onto the board
    const shipsPlaced: Ship[] = [];
    for (const [trackingID, placementInfo] of Object.entries(shipPlacementRequest.shipPlacements)) {
        const [x, y, rotation] = placementInfo;
        const ship = client.player!.ships[trackingID];

        let placementOK = false;
        if (ship !== undefined) {
            const region = client.game.scenario.board.regions[client.player!.spawnRegionID];
            placementOK = client.game.scenario.board.checkPlacement(ship, rotation, x, y, region);
        }

        // Undo ship placements if any placement is invalid
        if (!placementOK) {
            for (const placedShip of shipsPlaced) {
                client.game.scenario.board.removeShip(placedShip);
            }
            return;
        }

        ship.place(x, y, rotation);
        shipsPlaced.push(ship);
    }

    client.shipsPlaced = true;
    client.game.attemptGameStart();
}

/**
 * Schema for validating request JSON
 */
export const shipPlacementRequestSchema = baseRequestSchema.keys({
    request: 'shipPlacement',
    shipPlacements: Joi.object().pattern(Joi.string(),
        Joi.array().items(Joi.number(), Joi.number(), Joi.number().valid(Rotation.NoChange, Rotation.Clockwise90, Rotation.Clockwise180, Rotation.Clockwise270)).required()
    ).required()
});
