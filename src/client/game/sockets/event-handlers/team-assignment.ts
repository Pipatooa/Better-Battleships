import { ITeamAssignmentEvent } from '../../../../shared/network/events/i-team-assignment';

/**
 * Handles a team assignment event from the server
 *
 * @param  teamAssignment Event object to handle
 */
export function handleTeamAssignment(teamAssignment: ITeamAssignmentEvent): void {

    // Select player element using identity and reassign parent element to new team pane
    const playerElement = $(`#player-${teamAssignment.playerIdentity.replace(':', '\\:')}`);
    const teamPane = $(`#team-${teamAssignment.team}`);
    playerElement.appendTo(teamPane);
}
