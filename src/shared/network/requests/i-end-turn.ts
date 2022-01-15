import type { IBaseClientRequest } from './i-client-request';

/**
 * Request sent to server when client wants to end their turn prematurely
 */
export interface IEndTurnRequest extends IBaseClientRequest {
    request: 'endTurn'
}
