import {IBaseServerEvent} from './i-server-event';

/**
 * Game start event sent to client when the game begins
 */
export interface IGameStartEvent extends IBaseServerEvent {
    event: 'gameStart';
}