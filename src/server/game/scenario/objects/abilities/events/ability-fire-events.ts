import { abilityEventInfo } from './ability-events';

/**
 * Record describing all fire ability events
 */
export const abilityFireEventInfo = {
    ...abilityEventInfo,
    onHit: [['team', 'player', 'ship'], ['patternValue', 'hitCount', 'isThis', 'isFriendly', 'isVisible'], ['tile'], []],
    onHitSingle: [[], [], [], []],
    onMiss: [[], [], ['tile'], []],
    onMissCompletely: [[], [], [], []]
} as const;

/**
 * Type matching record describing all fire ability events
 */
export type AbilityFireEventInfo = typeof abilityFireEventInfo;

/**
 * Type matching all fire ability event name strings
 */
export type AbilityFireEvent = keyof AbilityFireEventInfo;
