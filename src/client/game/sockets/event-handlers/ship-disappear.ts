import { game }                     from '../../game';
import { selfPlayer }               from '../../player';
import { trackedShips }             from '../../scenario/ship';
import { updateCurrentView }        from '../../ui/managers/view-manager';
import { Message }                  from '../../ui/message';
import type { IShipDisappearEvent } from 'shared/network/events/i-ship-disappear';

/**
 * Handles a ship disappear event from the server
 *
 * @param  shipDisappearEvent Event object to handle
 */
export function handleShipDisappear(shipDisappearEvent: IShipDisappearEvent): void {
    const ship = trackedShips[shipDisappearEvent.trackingID];

    // Display update messages to player
    if (ship.player.team !== selfPlayer.team)
        new Message(`Enemy ${ship.descriptor.name} has disappeared!`);

    ship.deconstruct();
    updateCurrentView();
    game.board!.informationGenerator!.push();
    game.gameRenderer!.renderNext();
}
