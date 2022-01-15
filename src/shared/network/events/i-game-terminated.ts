import type { IBaseServerEvent } from './server-event';

/**
 * Event sent when the game is forcefully terminated
 */
export interface IGameTerminatedEvent extends IBaseServerEvent {
    event: 'gameTerminated',
    reason: string,
    message: string
}
