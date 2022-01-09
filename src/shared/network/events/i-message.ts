import type { IBaseServerEvent } from './server-event';

/**
 * Event sent when a message needs to be displayed
 */
export interface IMessageEvent extends IBaseServerEvent {
    event: 'message',
    display: 'message' | 'popup',
    message: string
}
