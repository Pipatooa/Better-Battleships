import { teamEventInfo } from './team-events';

/**
 * Record describing all player events
 */
export const playerEventInfo = {
    ...teamEventInfo,
    onTurnStart: [[], []],
    onTurnEnd: [[], []],
    onPlayerLostLocal: [[], []]
} as const;

/**
 * Type matching record describing all fire ability events
 */
export type PlayerEventInfo = typeof playerEventInfo;

/**
 * Type matching all player event name strings
 */
export type PlayerEvent = keyof PlayerEventInfo;
