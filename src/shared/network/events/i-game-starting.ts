import { IBaseServerEvent } from './i-server-event';

/**
 * Game start event sent to client when the game is going to start
 */
export interface IGameStartingEvent extends IBaseServerEvent {
    event: 'gameStarting',
    waitDuration: number
}