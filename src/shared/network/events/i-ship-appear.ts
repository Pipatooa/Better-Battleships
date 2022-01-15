import type { IShipInfo }        from '../scenario/i-ship-prototype-info';
import type { IShipUpdateEvent } from './i-ship-update';

/**
 * Event sent when a ship becomes visible to the client
 */
export interface IShipAppearEvent extends IShipUpdateEvent {
    event: 'shipAppear',
    shipInfo: IShipInfo
}
