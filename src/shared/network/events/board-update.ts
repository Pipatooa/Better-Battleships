import type { IBaseServerEvent } from './server-event';

/**
 * Event sent when the tiles of the board change
 */
export type BoardUpdateEvent =
    IFullBoardUpdateEvent |
    IPartialBoardUpdateEvent;

/**
 * Base event sent when the tiles of the board change
 */
export interface IBaseBoardUpdateEvent extends IBaseServerEvent {
    event: 'boardUpdate',
    full: boolean
}

/**
 * Event sent when the tiles of the board change
 *
 * Includes all tiles of the board
 */
export interface IFullBoardUpdateEvent extends IBaseBoardUpdateEvent {
    full: true,
    tiles: string[]
}

/**
 * Event sent when the tiles of the board change
 *
 * Includes only tiles which have changed
 */
export interface IPartialBoardUpdateEvent extends IBaseBoardUpdateEvent {
    full: false,
    tiles: [string, [number, number][]][]
}
