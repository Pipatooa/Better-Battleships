import {IPlayerReadyEvent} from '../../../../shared/network/events/i-player-ready';
import {ready} from '../button-functions';
import {identity} from './connection-info';

export function handlePlayerReady(playerReadyEvent: IPlayerReadyEvent) {
    let playerElement = $(`#player-${playerReadyEvent.playerIdentity.replace(':', '\\:')}`);

    if (playerReadyEvent.ready)
        playerElement.addClass('player-ready');
    else
        playerElement.removeClass('player-ready');

    if (playerReadyEvent.playerIdentity === identity) {
        $('#ready-button').off('click').on('click', () => ready(!ready))
            .text(playerReadyEvent.ready ? 'Not Ready' : 'Ready');
    }
}
