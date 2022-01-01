import type { IShipUpdateEvent } from './i-ship-update';

/**
 * Event sent when a ship disappears from view
 */
export interface IShipDisappearEvent extends IShipUpdateEvent {
    event: 'shipDisappear'
}
