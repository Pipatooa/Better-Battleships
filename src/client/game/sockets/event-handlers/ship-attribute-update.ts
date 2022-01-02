import { trackedShips }              from '../../scenario/ship';
import type { IShipAttributeUpdate } from 'shared/network/events/i-ship-attribute-update';

/**
 * Handles a ship attribute update event from the server
 *
 * @param  shipAttributeUpdateEvent Event object to handle
 */
export function handleShipAttributeUpdate(shipAttributeUpdateEvent: IShipAttributeUpdate): void {
    const ship = trackedShips[shipAttributeUpdateEvent.trackingID];
    ship.attributeCollection.updateAttributes(shipAttributeUpdateEvent.attributes);

    for (let i = 0; i < shipAttributeUpdateEvent.abilityAttributes.length; i++) {
        const ability = ship.abilities[i];
        const updates = shipAttributeUpdateEvent.abilityAttributes[i];
        ability.attributeCollection.updateAttributes(updates);
    }
}
