import {IBaseServerEvent} from './i-server-event';

/**
 * Player join event sent to client when another client joins the lobby
 *
 * Also sent to the client when they initially join the lobby, containing
 * information about all other clients already connected to the lobby
 */
export interface IPlayerJoinEvent extends IBaseServerEvent {
    event: 'playerJoin',
    playerIdentity: string,
    team: string | undefined,
    ready: boolean
}