import { IPlayerLeaveEvent } from '../../../../shared/network/events/i-player-leave';

/**
 * Handles a player leave event from the server
 *
 * @param  playerLeave Event object to handle
 */
export function handlePlayerLeave(playerLeave: IPlayerLeaveEvent): void {

    // Select and remove player element
    $(`#player-${playerLeave.playerIdentity.replace(':', '\\:')}`).remove();
}
