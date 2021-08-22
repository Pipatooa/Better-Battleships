import {IPlayerJoinEvent} from '../../../../shared/network/events/i-player-join';
import {IPlayerReadyEvent} from '../../../../shared/network/events/i-player-ready';
import {nameFromIdentity} from '../../../../shared/utility';
import {handlePlayerReady} from './player-ready';

/**
 * Handles a player join event from the server
 * @param playerJoin Event object to handle
 */
export function handlePlayerJoin(playerJoin: IPlayerJoinEvent) {

    // Get correct team pane for the player's team
    let pane: JQuery;
    if (playerJoin.team === undefined)
        pane = $('#unassigned-pane');
    else
        pane = $(`#team-${playerJoin.team}`);

    // Get display name from client identity string
    let playerName = nameFromIdentity(playerJoin.playerIdentity);

    // Create new element for player using identity and name. Add to pane
    let playerElement = $(`<div class="" id="player-${playerJoin.playerIdentity}"></div>`);
    playerElement.text(playerName);
    pane.append(playerElement);

    handlePlayerReady(playerJoin as unknown as IPlayerReadyEvent);
}