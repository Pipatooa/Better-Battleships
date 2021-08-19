import {IPlayerLeave} from '../../network/i-player-leave';

export function handlePlayerLeave(playerLeave: IPlayerLeave) {
    $(`#player-${playerLeave.playerID}`).remove();
}