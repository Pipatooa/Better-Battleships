import { IPlayerReadyEvent } from '../../../../shared/network/events/i-player-ready';
import { allPlayers } from '../../player';
import { ready } from '../button-functions';
import { selfIdentity } from './connection-info';

/**
 * Handles a player ready event from the server
 *
 * @param  playerReadyEvent Event object to handle
 */
export function handlePlayerReady(playerReadyEvent: IPlayerReadyEvent): void {

    // Get player element using identity provided
    const player = allPlayers[playerReadyEvent.playerIdentity];

    // Depending on new ready status, add or remove ready class
    if (playerReadyEvent.ready)
        player.lobbyElement.addClass('player-ready');
    else
        player.lobbyElement.removeClass('player-ready');

    // If player that is ready is us
    if (playerReadyEvent.playerIdentity === selfIdentity) {

        // Re-register button event handler and update button text
        $('#ready-button').off('click').on('click', () => ready(!playerReadyEvent.ready))
            .text(playerReadyEvent.ready ? 'Not Ready' : 'Ready');

        // Disable/Enable team join buttons
        $('.join-team-button').attr('disabled', playerReadyEvent.ready as any);
    }
}
