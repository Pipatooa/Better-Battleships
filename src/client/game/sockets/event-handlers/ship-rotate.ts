import { game }                  from 'client/game/game';
import { selfPlayer }            from '../../player';
import { trackedShips }          from '../../scenario/ship';
import { updateCurrentView }     from '../../ui/managers/view-manager';
import { Message }               from '../../ui/message';
import type { IShipRotateEvent } from 'shared/network/events/i-ship-rotate';

/**
 * Handles a ship rotate event from the server
 *
 * @param  shipRotateEvent Event object to handle
 */
export function handleShipRotate(shipRotateEvent: IShipRotateEvent): void {
    const ship = trackedShips[shipRotateEvent.trackingID];
    ship.rotate(shipRotateEvent.rotation);
    updateCurrentView();
    game.board!.informationGenerator!.push();
    game.gameRenderer!.renderNext();

    // Display update messages to player
    if (ship.player.team !== selfPlayer.team)
        new Message(`Enemy ${ship.descriptor.name} has rotated!`);
}
