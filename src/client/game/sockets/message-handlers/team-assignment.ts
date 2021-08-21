export function handleTeamAssignment(teamAssignment: ITeamAssignment) {
    let playerElement = $(`#player-${teamAssignment.playerIdentity.replace(':', '\\:')}`);
    playerElement.appendTo($(`#team-${teamAssignment.team}`));
}

export interface ITeamAssignment {
    dataType: 'teamAssignment',
    playerIdentity: string,
    team: string
}