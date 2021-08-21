import {IPlayerJoin} from '../../network/i-player-join';
import {nameFromIdentity} from '../unpack-identity';

export function handlePlayerJoin(playerJoin: IPlayerJoin) {

    // Get correct team pane for the player's team
    let pane: JQuery;
    if (playerJoin.team === undefined)
        pane = $('#unassigned-pane');
    else
        pane = $(`#team-${playerJoin.team}`);

    // Get display name from client identity string
    let playerName = nameFromIdentity(playerJoin.playerIdentity);

    // Create new element for player and add to relevant team pane
    let playerElement = $(`<div class="" id="player-${playerJoin.playerIdentity}"></div>`);
    playerElement.text(nameFromIdentity(playerJoin.playerIdentity));
    pane.append(playerElement);
}