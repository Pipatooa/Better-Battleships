import type { IBaseServerEvent } from './i-server-event';

/**
 * Event sent when the game starts
 */
export interface ITurnAdvancement extends IBaseServerEvent {
    event: 'turnAdvancement'
}
