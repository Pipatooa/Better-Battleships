import { IBaseClientRequest } from './i-client-request';

/**
 * Ship placement request sent to server when client initially places their ships at the start of the game
 */
export interface IShipPlacementRequest extends IBaseClientRequest {
    request: 'shipPlacement',
    shipPlacements: [number, number][]
}