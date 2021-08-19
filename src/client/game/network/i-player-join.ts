export interface IPlayerJoin {
    dataType: 'playerJoin',
    playerID: string,
    team: string | null,
    ready: boolean
}