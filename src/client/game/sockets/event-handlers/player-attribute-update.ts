import { allPlayers }                       from '../../player';
import type { IPlayerAttributeUpdateEvent } from 'shared/network/events/i-player-attribute-update';

/**
 * Handles a player attribute update event from the server
 *
 * @param  playerAttributeUpdateEvent Event object to handle
 */
export function handlePlayerAttributeUpdate(playerAttributeUpdateEvent: IPlayerAttributeUpdateEvent): void {
    const player = allPlayers[playerAttributeUpdateEvent.player];
    player.attributeCollection!.updateAttributes(playerAttributeUpdateEvent.attributes);
}
