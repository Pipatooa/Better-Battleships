import { shipEventInfo } from '../../events/ship-events';

/**
 * Record describing all ability events
 */
export const abilityEventInfo = {
    ...shipEventInfo,
    onUse: [[], []]
} as const;

/**
 * Type matching record describing all ability events
 */
export type AbilityEventInfo = typeof abilityEventInfo;

/**
 * Type matching all ability event name strings
 */
export type AbilityEvent = keyof AbilityEventInfo;
