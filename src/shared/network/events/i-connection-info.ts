import {IBaseServerEvent} from './i-server-event';

export interface IConnectionInfoEvent extends IBaseServerEvent {
    event: 'connectionInfo',
    identity: string
}