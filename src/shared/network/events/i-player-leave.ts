import type { IBaseServerEvent } from './i-server-event';

/**
 * Event sent when another client leaves the game
 */
export interface IPlayerLeaveEvent extends IBaseServerEvent {
    event: 'playerLeave',
    playerIdentity: string
}
