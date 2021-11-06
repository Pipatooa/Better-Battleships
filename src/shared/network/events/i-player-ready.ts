import type { IBaseServerEvent } from './i-server-event';

/**
 * Event sent when a client changes their ready status
 */
export interface IPlayerReadyEvent extends IBaseServerEvent {
    event: 'playerReady',
    playerIdentity: string,
    ready: boolean
}
