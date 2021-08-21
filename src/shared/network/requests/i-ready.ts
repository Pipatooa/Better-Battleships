import {IBaseClientRequest} from './i-client-request';

export interface IReadyRequest extends IBaseClientRequest {
    request: 'ready',
    value: boolean
}