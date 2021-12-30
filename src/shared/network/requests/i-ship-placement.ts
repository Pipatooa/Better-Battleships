import type { Rotation }           from '../../scenario/objects/common/rotation';
import type { IBaseClientRequest } from './i-client-request';

/**
 * Ship placement request sent to server when client initially places their ships at the start of the game
 */
export interface IShipPlacementRequest extends IBaseClientRequest {
    request: 'shipPlacement',
    shipPlacements: { [trackingID: string]: [x: number, y: number, rotation: Rotation] }
}
