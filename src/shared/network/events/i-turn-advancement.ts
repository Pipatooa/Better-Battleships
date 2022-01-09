import type { IBaseServerEvent } from './server-event';

/**
 * Event sent when the game starts
 */
export interface ITurnAdvancementEvent extends IBaseServerEvent {
    event: 'turnAdvancement',
    player: string
}
