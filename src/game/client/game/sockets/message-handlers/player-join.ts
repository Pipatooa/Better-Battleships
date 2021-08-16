import {IPlayerJoin} from '../../network/i-player-join';

export function handlePlayerJoin(playerJoin: IPlayerJoin) {

    let pane: JQuery;

    if (playerJoin.team === undefined)
        pane = $('#unassigned-pane');
    else
        pane = $(`#team-${playerJoin.team}`);

    let playerElement = $(`<div class="" id="player-${playerJoin.playerID}">${playerJoin.playerID}</div>`);
    pane.append(playerElement);
}