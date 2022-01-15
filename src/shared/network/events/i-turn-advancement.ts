import type { IBaseServerEvent } from './server-event';

/**
 * Event sent when the current player's turn is advanced
 */
export interface ITurnAdvancementEvent extends IBaseServerEvent {
    event: 'turnAdvancement',
    player: string
}
