import {IBaseServerEvent} from './i-server-event';

/**
 * Connection info event sent to the client when a socket connection is successfully made
 */
export interface IConnectionInfoEvent extends IBaseServerEvent {
    event: 'connectionInfo',
    identity: string
}