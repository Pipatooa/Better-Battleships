import {IBaseServerEvent} from './i-server-event';

export interface IPlayerReadyEvent extends IBaseServerEvent {
    event: 'playerReady',
    playerIdentity: string,
    ready: boolean
}