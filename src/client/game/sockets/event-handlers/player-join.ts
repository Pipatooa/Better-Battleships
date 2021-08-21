import {IPlayerJoinEvent} from '../../../../shared/network/events/i-player-join';
import {IPlayerReadyEvent} from '../../../../shared/network/events/i-player-ready';
import {nameFromIdentity} from '../../../../shared/utility';
import {handlePlayerReady} from './player-ready';

export function handlePlayerJoin(playerJoin: IPlayerJoinEvent) {

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

    handlePlayerReady(playerJoin as unknown as IPlayerReadyEvent);
}