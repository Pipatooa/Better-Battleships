import { allPlayers }             from '../../player';
import type { IPlayerLeaveEvent } from 'shared/network/events/i-player-leave';

/**
 * Handles a player leave event from the server
 *
 * @param  playerLeave Event object to handle
 */
export function handlePlayerLeave(playerLeave: IPlayerLeaveEvent): void {

    // Deconstruct player
    const player = allPlayers[playerLeave.playerIdentity];
    player.deconstruct();
}
