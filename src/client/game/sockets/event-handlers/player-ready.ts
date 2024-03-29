import { allPlayers }             from '../../player';
import { ready }                  from '../../ui/misc-buttons';
import { selfIdentity }           from './connection-info';
import type { IPlayerReadyEvent } from 'shared/network/events/i-player-ready';

/**
 * Handles a player ready event from the server
 *
 * @param  playerReadyEvent Event object to handle
 */
export function handlePlayerReady(playerReadyEvent: IPlayerReadyEvent): void {

    // Get player element using identity provided
    const player = allPlayers[playerReadyEvent.player];
    player.ready(playerReadyEvent.ready);

    // If player that is ready is us
    if (playerReadyEvent.player === selfIdentity) {

        // Re-register button event handler and update button text
        $('#ready-button').off('click').on('click', () => ready(!playerReadyEvent.ready))
            .text(playerReadyEvent.ready ? 'Not Ready' : 'Ready');

        // Disable/Enable team join buttons
        $('.join-team-button').attr('disabled', playerReadyEvent.ready as any);
    }
}
