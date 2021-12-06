import type { IShipUpdateEvent } from './i-ship-update-event';
import type { Rotation }         from 'shared/scenario/objects/common/rotation';

/**
 * Event sent when a ship is rotated
 */
export interface IShipRotateEvent extends IShipUpdateEvent {
    event: 'shipRotate',
    rotation: Rotation
}
