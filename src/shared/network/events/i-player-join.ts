import type { IBaseServerEvent } from './i-server-event';

/**
 * Event sent when another client joins the lobby
 */
export interface IPlayerJoinEvent extends IBaseServerEvent {
    event: 'playerJoin',
    playerIdentity: string,
    team: string | undefined,
    ready: boolean
}
