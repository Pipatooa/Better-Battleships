import { allPlayers }            from '../../player';
import type { IPlayerLostEvent } from 'shared/network/events/i-player-lost';

/**
 * Handles a player lost event from the server
 *
 * @param  playerLostEvent Event object to handle
 */
export function handlePlayerLost(playerLostEvent: IPlayerLostEvent): void {
    const player = allPlayers[playerLostEvent.player];
    player.lose();
}
