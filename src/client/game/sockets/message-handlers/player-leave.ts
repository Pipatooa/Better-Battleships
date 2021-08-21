export function handlePlayerLeave(playerLeave: IPlayerLeave) {
    $(`#player-${playerLeave.playerIdentity}`).remove();
}

export interface IPlayerLeave {
    dataType: 'playerLeave',
    playerIdentity: string
}