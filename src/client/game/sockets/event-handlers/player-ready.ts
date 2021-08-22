import {IPlayerReadyEvent} from '../../../../shared/network/events/i-player-ready';
import {ready} from '../button-functions';
import {identity} from './connection-info';

/**
 * Handles a player ready event from the server
 * @param playerReadyEvent Event object to handle
 */
export function handlePlayerReady(playerReadyEvent: IPlayerReadyEvent) {

    // Get player element using identity provided
    let playerElement = $(`#player-${playerReadyEvent.playerIdentity.replace(':', '\\:')}`);

    // Depending on new ready status, add or remove ready class
    if (playerReadyEvent.ready)
        playerElement.addClass('player-ready');
    else
        playerElement.removeClass('player-ready');

    // If player that is ready is us, change the ready button appropriately
    if (playerReadyEvent.playerIdentity === identity) {

        // Re-register button event handler and update button text
        $('#ready-button').off('click').on('click', () => ready(!playerReadyEvent.ready))
            .text(playerReadyEvent.ready ? 'Not Ready' : 'Ready');
    }
}
