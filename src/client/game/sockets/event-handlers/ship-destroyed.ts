import { trackedShips }             from '../../scenario/ship';
import type { IShipDestroyedEvent } from '../../../../shared/network/events/i-ship-destroyed';

/**
 * Handles a ship destroyed event from the server 
 *
 * @param  shipDestroyedEvent Event object to handle
 */
export function handleShipDestroyed(shipDestroyedEvent: IShipDestroyedEvent): void {
    trackedShips[shipDestroyedEvent.trackingID].deconstruct();
}
