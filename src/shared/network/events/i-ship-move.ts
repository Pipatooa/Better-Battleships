import type { IShipUpdateEvent } from './i-ship-update';

/**
 * Event sent when a ship is moved
 */
export interface IShipMoveEvent extends IShipUpdateEvent {
    event: 'shipMove',
    x: number,
    y: number
}
