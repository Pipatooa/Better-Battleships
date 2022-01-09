import { selfPlayer }                from '../../player';
import { trackedShips }              from '../../scenario/ship';
import { Message }                   from '../../ui/message';
import type { IShipAttributeUpdate } from 'shared/network/events/i-ship-attribute-update';

/**
 * Handles a ship attribute update event from the server
 *
 * @param  shipAttributeUpdateEvent Event object to handle
 */
export function handleShipAttributeUpdate(shipAttributeUpdateEvent: IShipAttributeUpdate): void {
    const ship = trackedShips[shipAttributeUpdateEvent.trackingID];
    const oldSpotting = ship.attributeCollection.getValue('@spottedBy');

    // Update ship attributes and ability attributes
    ship.attributeCollection.updateAttributes(shipAttributeUpdateEvent.attributes);
    for (let i = 0; i < shipAttributeUpdateEvent.abilityAttributes.length; i++) {
        const ability = ship.abilities[i];
        const updates = shipAttributeUpdateEvent.abilityAttributes[i];
        ability.attributeCollection.updateAttributes(updates);
    }

    const newSpotting = shipAttributeUpdateEvent.attributes['@spottedBy'];

    // Display spotting update messages to player if allied ship spotting has changed
    if (ship.player.team === selfPlayer.team && newSpotting !== undefined) {
        let owner = ship.player === selfPlayer ? 'Your' : "Your team's";
        if (oldSpotting === 0)
            new Message(`${owner} ${ship.descriptor.name} has been spotted!`);
        else if (newSpotting === 0)
            new Message(`${owner} ${ship.descriptor.name} is no longer being spotted!`);
    }
}
