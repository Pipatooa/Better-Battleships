import type { IBaseServerEvent } from './server-event';

/**
 * Event sent when the game ends
 */
export interface IGameOverEvent extends IBaseServerEvent {
    event: 'gameOver',
    winningTeam: string,
    message: string
}
