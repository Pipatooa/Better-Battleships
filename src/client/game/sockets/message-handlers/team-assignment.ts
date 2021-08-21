import {ITeamAssignment} from '../../network/i-team-assignment';

export function handleTeamAssignment(teamAssignment: ITeamAssignment) {
    let playerElement = $(`#player-${teamAssignment.playerIdentity.replace(':', '\\:')}`);
    playerElement.appendTo($(`#team-${teamAssignment.team}`));
}