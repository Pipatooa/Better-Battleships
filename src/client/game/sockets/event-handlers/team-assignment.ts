import {ITeamAssignmentEvent} from '../../../../shared/network/events/i-team-assignment';

/**
 * Handles a team assignment event from the server
 * @param teamAssignment Event object to handle
 */
export function handleTeamAssignment(teamAssignment: ITeamAssignmentEvent) {

    // Select player element using identity and reassign parent element to new team pane
    let playerElement = $(`#player-${teamAssignment.playerIdentity.replace(':', '\\:')}`);
    let teamPane = $(`#team-${teamAssignment.team}`);
    playerElement.appendTo(teamPane);
}
