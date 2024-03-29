import { baseEventInfo } from '../../events/base-events';

/**
 * Record describing all team events
 */
export const teamEventInfo = {
    ...baseEventInfo,
    onPlayerLostFriendly: [['player'], [], [], []],
    onPlayerLostUnfriendly: [['team', 'player'], [], [], []],
    onTeamLostLocal: [[], [], [], []],
    onTeamLostForeign: [['team'], [], [], []]
} as const;

/**
 * Type matching record describing all ship events
 */
export type TeamEventInfo = typeof teamEventInfo;

/**
 * Type matching all team event name strings
 */
export type TeamEvent = keyof TeamEventInfo;
