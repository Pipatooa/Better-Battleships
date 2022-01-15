import { game }                from 'client/game/game';
import { selfPlayer }          from '../../player';
import { trackedShips }        from '../../scenario/ship';
import { updateCurrentView }   from '../../ui/managers/view-manager';
import { Message }             from '../../ui/message';
import type { IShipMoveEvent } from 'shared/network/events/i-ship-move';

/**
 * Handles a ship move event from the server
 *
 * @param  shipMoveEvent Event object to handle
 */
export function handleShipMove(shipMoveEvent: IShipMoveEvent): void {
    const ship = trackedShips[shipMoveEvent.trackingID];
    ship.moveTo(shipMoveEvent.x, shipMoveEvent.y);
    updateCurrentView();
    game.board!.informationGenerator!.push();
    game.gameRenderer!.renderNext();

    // Display update messages to player
    if (ship.player.team !== selfPlayer.team)
        new Message(`An enemy ${ship.descriptor.name} has moved!`);
}
