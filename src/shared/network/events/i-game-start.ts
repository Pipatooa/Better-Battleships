import type { IBaseServerEvent } from './i-server-event';

/**
 * Event sent when the game starts
 */
export interface IGameStartEvent extends IBaseServerEvent {
    event: 'gameStart',
    turnOrder: string[],
    maxTurnTime: number
}
