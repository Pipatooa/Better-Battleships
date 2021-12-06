import type { IShipInfo }        from '../scenario/i-ship-prototype-info';
import type { IShipUpdateEvent } from './i-ship-update-event';

export interface IShipAppearEvent extends IShipUpdateEvent {
    event: 'shipAppear',
    shipInfo: IShipInfo
}
