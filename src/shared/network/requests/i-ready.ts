import {IBaseClientRequest} from './i-client-request';

/**
 * Ready request sent to server when client wants to change ready status
 */
export interface IReadyRequest extends IBaseClientRequest {
    request: 'ready',
    value: boolean
}