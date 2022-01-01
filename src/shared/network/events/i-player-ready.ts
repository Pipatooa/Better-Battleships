import type { IPlayerUpdateEvent } from './i-player-update';

/**
 * Event sent when a client changes their ready status
 */
export interface IPlayerReadyEvent extends IPlayerUpdateEvent {
    event: 'playerReady',
    ready: boolean
}
