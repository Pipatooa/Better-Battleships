import { game }                     from 'client/game/game';
import { trackedShips }             from '../../scenario/ship';
import { updateCurrentView }        from '../../ui/managers/view-manager';
import type { IShipDestroyedEvent } from 'shared/network/events/i-ship-destroyed';

/**
 * Handles a ship destroyed event from the server 
 *
 * @param  shipDestroyedEvent Event object to handle
 */
export function handleShipDestroyed(shipDestroyedEvent: IShipDestroyedEvent): void {
    trackedShips[shipDestroyedEvent.trackingID].deconstruct();
    updateCurrentView();
    game.board!.informationGenerator!.push();
    game.gameRenderer!.renderNext();
}
