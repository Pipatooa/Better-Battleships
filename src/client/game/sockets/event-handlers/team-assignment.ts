import { game }                            from '../../game';
import { allPlayers }                      from '../../player';
import type { IPlayerTeamAssignmentEvent } from 'shared/network/events/i-player-team-assignment';

/**
 * Handles a team assignment event from the server
 *
 * @param  teamAssignment Event object to handle
 */
export function handlePlayerTeamAssignment(teamAssignment: IPlayerTeamAssignmentEvent): void {

    // Fetch player and team and reassign player to team
    const player = allPlayers[teamAssignment.player];
    const team = game.teams[teamAssignment.team];
    player.assignTeam(team);
}
