import {ITeamAssignment} from '../../network/i-team-assignment';

export function handleTeamAssignment(teamAssignment: ITeamAssignment) {
    let playerElement = $(`#player-${teamAssignment.playerID}`);

    console.log(`#player-${teamAssignment.playerID}`, playerElement);
    playerElement.appendTo($(`#team-${teamAssignment.team}`));
}