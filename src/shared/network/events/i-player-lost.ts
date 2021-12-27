import type { IBaseServerEvent } from './i-server-event';

/**
 * Event sent when another client is eliminated from the game
 */
export interface IPlayerLostEvent extends IBaseServerEvent {
    event: 'playerLost',
    playerIdentity: string
}
