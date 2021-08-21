import {IBaseServerEvent} from './i-server-event';

export interface IPlayerLeaveEvent extends IBaseServerEvent {
    event: 'playerLeave',
    playerIdentity: string
}