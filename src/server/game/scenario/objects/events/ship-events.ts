import { playerEventInfo } from './player-events';

/**
 * Record describing all ship events
 */
export const shipEventInfo = {
    ...playerEventInfo
} as const;

/**
 * Type matching record describing all fire ability events
 */
export type ShipEventInfo = typeof shipEventInfo;

/**
 * Type matching all ship event name strings
 */
export type ShipEvent = keyof ShipEventInfo;
