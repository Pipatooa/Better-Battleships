import { trackedShips }            from '../../scenario/ship';
import type { IShipAbilityUpdate } from 'shared/network/events/i-ship-ability-update';

/**
 * Handles a ship ability update event from the server
 *
 * @param  shipAbilityUpdateEvent Event object to handle
 */
export function handleShipAbilityUpdate(shipAbilityUpdateEvent: IShipAbilityUpdate): void {
    const ship = trackedShips[shipAbilityUpdateEvent.trackingID];
    for (let i = 0; i < shipAbilityUpdateEvent.usabilityUpdates.length; i++) {
        const usabilityUpdate = shipAbilityUpdateEvent.usabilityUpdates[i];
        const ability = ship.abilities[i];
        ability.updateUsability(usabilityUpdate);
    }
}
