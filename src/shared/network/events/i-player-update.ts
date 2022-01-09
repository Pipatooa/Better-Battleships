import type { IBaseServerEvent } from './server-event';

/**
 * Event sent when an update to a player occurs
 */
export interface IPlayerUpdateEvent extends IBaseServerEvent {
    player: string
}
