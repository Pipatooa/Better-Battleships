import type { IPlayerUpdateEvent } from './i-player-update';

/**
 * Event sent when another client is timed out
 */
export interface IPlayerTimedOutEvent extends IPlayerUpdateEvent {
    event: 'playerTimedOut'
}
