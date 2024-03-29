import type { IShipUpdateEvent } from './i-ship-update';
import type { Rotation }         from 'shared/scenario/rotation';

/**
 * Event sent when a ship is rotated
 */
export interface IShipRotateEvent extends IShipUpdateEvent {
    event: 'shipRotate',
    rotation: Rotation
}
