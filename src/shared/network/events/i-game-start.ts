import type { IBaseServerEvent } from './server-event';

/**
 * Event sent when the game starts
 */
export interface IGameStartEvent extends IBaseServerEvent {
    event: 'gameStart'
}
