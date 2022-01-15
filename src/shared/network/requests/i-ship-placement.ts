import type { Rotation }           from '../../scenario/rotation';
import type { IBaseClientRequest } from './i-client-request';

/**
 * Request sent when the client places their ships during setup
 */
export interface IShipPlacementRequest extends IBaseClientRequest {
    request: 'shipPlacement',
    shipPlacements: { [trackingID: string]: [x: number, y: number, rotation: Rotation] }
}
