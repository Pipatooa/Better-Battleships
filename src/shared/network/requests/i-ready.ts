import type { IBaseClientRequest } from './i-client-request';

/**
 * Request sent when client wants to change ready status
 */
export interface IReadyRequest extends IBaseClientRequest {
    request: 'ready',
    value: boolean
}
