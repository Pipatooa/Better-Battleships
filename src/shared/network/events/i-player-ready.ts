import { IBaseServerEvent } from './i-server-event';

/**
 * Player ready event sent when a client changes their ready status
 */
export interface IPlayerReadyEvent extends IBaseServerEvent {
    event: 'playerReady',
    playerIdentity: string,
    ready: boolean
}