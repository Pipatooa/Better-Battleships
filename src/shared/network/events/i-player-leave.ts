import type { IPlayerUpdateEvent } from './i-player-update';

/**
 * Event sent when another client leaves the game
 */
export interface IPlayerLeaveEvent extends IPlayerUpdateEvent {
    event: 'playerLeave'
}
