import { baseEventInfo } from '../../events/base-events';

/**
 * Record describing all team events
 */
export const teamEventInfo = {
    ...baseEventInfo
} as const;

/**
 * Type matching record describing all fire ability events
 */
export type TeamEventInfo = typeof teamEventInfo;

/**
 * Type matching all team event name strings
 */
export type TeamEvent = keyof TeamEventInfo;
