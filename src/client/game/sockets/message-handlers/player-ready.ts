import {socket} from '../opener';
import {identity} from './connection-info';

export function handlePlayerReady(playerReady: IPlayerReady) {
    let playerElement = $(`#player-${playerReady.playerIdentity.replace(':', '\\:')}`);

    if (playerReady.ready)
        playerElement.addClass('player-ready');
    else
        playerElement.removeClass('player-ready');

    if (playerReady.playerIdentity === identity) {
        $('#ready-button').off('click').on('click', () => {
            socket.send(JSON.stringify({
                request: 'ready',
                value: !playerReady.ready
            }))
        }).text(playerReady.ready ? 'Not Ready' : 'Ready');
    }
}

export interface IPlayerReady {
    dataType: 'playerReady',
    playerIdentity: string,
    ready: boolean
}