import {IBaseServerEvent} from './i-server-event';

export interface IPlayerJoinEvent extends IBaseServerEvent {
    event: 'playerJoin',
    playerIdentity: string,
    team: string | undefined,
    ready: boolean
}