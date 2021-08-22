import {IBaseServerEvent} from './i-server-event';

/**
 * Player leave event sent to the client when another client leaves the game
 */
export interface IPlayerLeaveEvent extends IBaseServerEvent {
    event: 'playerLeave',
    playerIdentity: string
}