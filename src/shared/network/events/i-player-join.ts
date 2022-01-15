import type { IPlayerUpdateEvent } from './i-player-update';

/**
 * Event sent when another client joins the lobby
 */
export interface IPlayerJoinEvent extends IPlayerUpdateEvent {
    event: 'playerJoin',
    reconnection: boolean
}
