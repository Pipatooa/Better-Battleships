import { game }                     from 'client/game/game';
import { selfPlayer }               from '../../player';
import { trackedShips }             from '../../scenario/ship';
import { updateCurrentView }        from '../../ui/managers/view-manager';
import { Message }                  from '../../ui/message';
import type { IShipDestroyedEvent } from 'shared/network/events/i-ship-destroyed';

/**
 * Handles a ship destroyed event from the server 
 *
 * @param  shipDestroyedEvent Event object to handle
 */
export function handleShipDestroyed(shipDestroyedEvent: IShipDestroyedEvent): void {
    const ship = trackedShips[shipDestroyedEvent.trackingID];

    // Display update messages to player
    if (ship.player.team !== selfPlayer.team)
        new Message(`Enemy ${ship.descriptor.name} destroyed!`);
    else {
        let owner = ship.player === selfPlayer ? 'Your' : "Your team's";
        new Message(`${owner} ${ship.descriptor.name} was destroyed!`);
    }

    ship.deconstruct();
    updateCurrentView();
    game.board!.informationGenerator!.push();
    game.gameRenderer!.renderNext();
}
