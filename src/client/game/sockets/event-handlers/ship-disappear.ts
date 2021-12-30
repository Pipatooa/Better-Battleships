import { game }                     from '../../game';
import { trackedShips }             from '../../scenario/ship';
import type { IShipDisappearEvent } from 'shared/network/events/i-ship-disappear';

/**
 * Handles a ship disappear event from the server
 *
 * @param  shipDisappearEvent Event object to handle
 */
export function handleShipDisappear(shipDisappearEvent: IShipDisappearEvent): void {
    trackedShips[shipDisappearEvent.trackingID].deconstruct();
    game.board!.informationGenerator!.push();
    game.gameRenderer!.renderNext();
}
