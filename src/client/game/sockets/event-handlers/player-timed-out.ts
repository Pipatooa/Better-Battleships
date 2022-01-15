import { allPlayers }                from '../../player';
import { Message }                   from '../../ui/message';
import type { IPlayerTimedOutEvent } from 'shared/network/events/i-player-timed-out';

/**
 * Handles a player timed out event from the server
 *
 * @param  playerTimedOutEvent Event object to handle
 */
export function handlePlayerTimedOut(playerTimedOutEvent: IPlayerTimedOutEvent): void {
    const player = allPlayers[playerTimedOutEvent.player];
    new Message(`${player.name} has been timed out.`);
}
