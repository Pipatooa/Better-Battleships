export interface IPlayerJoin {
    dataType: 'playerJoin',
    playerID: string,
    team: string | undefined,
    ready: boolean
}