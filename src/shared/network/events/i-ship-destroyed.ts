import type { IShipUpdateEvent } from './i-ship-update';

/**
 * Event sent when a ship is destroyed
 */
export interface IShipDestroyedEvent extends IShipUpdateEvent {
    event: 'shipDestroyed'
}
