import type { IBaseServerEvent } from './i-server-event';

/**
 * Event sent when a socket connection is successfully made
 */
export interface IConnectionInfoEvent extends IBaseServerEvent {
    event: 'connectionInfo',
    identity: string
}
