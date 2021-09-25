import { ITeamAssignmentEvent } from '../../../../shared/network/events/i-team-assignment';
import { game } from '../../game';
import { allPlayers } from '../../player';

/**
 * Handles a team assignment event from the server
 *
 * @param  teamAssignment Event object to handle
 */
export function handleTeamAssignment(teamAssignment: ITeamAssignmentEvent): void {

    // Fetch player and team and reassign player to team
    const player = allPlayers[teamAssignment.playerIdentity];
    const team = game.teams[teamAssignment.team];
    player.assignTeam(team);
}
