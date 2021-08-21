import {ITeamAssignmentEvent} from '../../../../shared/network/events/i-team-assignment';

export function handleTeamAssignment(teamAssignment: ITeamAssignmentEvent) {
    let playerElement = $(`#player-${teamAssignment.playerIdentity.replace(':', '\\:')}`);
    playerElement.appendTo($(`#team-${teamAssignment.team}`));
}
