import type { IPlayerUpdateEvent } from './i-player-update';

/**
 * Event sent when another client is eliminated from the game
 */
export interface IPlayerLostEvent extends IPlayerUpdateEvent {
    event: 'playerLost'
}
