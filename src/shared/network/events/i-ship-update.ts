import type { IBaseServerEvent } from './server-event';

/**
 * Event sent when an update to a ship occurs
 */
export interface IShipUpdateEvent extends IBaseServerEvent {
    trackingID: string
}
