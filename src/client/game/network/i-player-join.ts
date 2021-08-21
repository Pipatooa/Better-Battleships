export interface IPlayerJoin {
    dataType: 'playerJoin',
    playerIdentity: string,
    team: string | undefined,
    ready: boolean
}