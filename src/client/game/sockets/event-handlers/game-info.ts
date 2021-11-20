import type { IGameInfoEvent } from '../../../../shared/network/events/i-game-info';
import { searchParams } from '../../../game';
import { Game } from '../../game';
import { Player } from '../../player';
import { Team } from '../../team';
import { joinTeam, ready } from '../button-functions';

/**
 * Handles a game info event from the server
 *
 * @param  gameInfo Event object to handle
 */
export function handleGameInfo(gameInfo: IGameInfoEvent): void {

    // Set name, author and description field elements using JQuery
    $('#scenario-name-field').text(gameInfo.scenario.descriptor.name);
    $('#scenario-author-field').text(gameInfo.scenario.author);
    $('#scenario-description-field').text(gameInfo.scenario.descriptor.description);

    // Unpack team data
    let teams: { [id: string]: Team } = {};
    for (const [id, teamInfo] of Object.entries(gameInfo.scenario.teams)) {
        teams[id] = new Team(id, teamInfo);
    }

    // Unpack player assignments for lobby
    for (const [playerIdentity, playerInfo] of Object.entries(gameInfo.playerInfo)) {
        const [teamID, ready] = playerInfo;
        const player = new Player(playerIdentity, ready);

        // Assign player to team if necessary
        if (teamID !== null) {
            const team = teams[teamID];
            player.assignTeam(team);
        }
    }

    // Initialise main game object
    new Game(teams);

    // If team flag set, automatically assign this player to a team
    if (searchParams.has('team')) {
        joinTeam(searchParams.get('team')!);
        ready(true);
    }
}
