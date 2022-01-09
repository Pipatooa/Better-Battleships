import { allPlayers, selfPlayer } from '../../player';
import { Message }                from '../../ui/message';
import type { IPlayerLostEvent }  from 'shared/network/events/i-player-lost';

/**
 * Handles a player lost event from the server
 *
 * @param  playerLostEvent Event object to handle
 */
export function handlePlayerLost(playerLostEvent: IPlayerLostEvent): void {
    const player = allPlayers[playerLostEvent.player];
    player.lose();

    // Display update messages to player
    if (player === selfPlayer)
        new Message("You've been eliminated from the game!");
    else
        new Message(`${player.name} has been eliminated from the game!`);
}
