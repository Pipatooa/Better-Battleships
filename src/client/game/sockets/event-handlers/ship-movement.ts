import { game }                from 'client/game/game';
import { trackedShips }        from '../../scenario/ship';
import type { IShipMoveEvent } from 'shared/network/events/i-ship-move';

/**
 * Handles a ship move event from the server
 *
 * @param  shipMoveEvent Event object to handle
 */
export function handleShipMove(shipMoveEvent: IShipMoveEvent): void {
    const ship = trackedShips[shipMoveEvent.trackingID];
    ship.moveTo(shipMoveEvent.x, shipMoveEvent.y);
    game.board!.informationGenerator!.push();
    game.gameRenderer!.renderNext();
}
