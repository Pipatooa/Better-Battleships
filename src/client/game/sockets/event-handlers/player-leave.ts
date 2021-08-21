import {IPlayerLeaveEvent} from '../../../../shared/network/events/i-player-leave';

export function handlePlayerLeave(playerLeave: IPlayerLeaveEvent) {
    $(`#player-${playerLeave.playerIdentity}`).remove();
}
