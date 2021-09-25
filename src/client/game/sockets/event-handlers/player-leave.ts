import { IPlayerLeaveEvent } from '../../../../shared/network/events/i-player-leave';
import { allPlayers } from '../../player';

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
