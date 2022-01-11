import { abilityEventInfo } from './ability-events';

/**
 * Record describing all fire ability events
 */
export const fireAbilityEventInfo = {
    ...abilityEventInfo,
    onHit: [['team', 'player', 'ship'], ['patternValue', 'hitCount'], ['tile'], []],
    onMiss: [[], [], ['tile'], []],
    onMissCompletely: [[], [], [], []]
} as const;

/**
 * Type matching record describing all fire ability events
 */
export type FireAbilityEventInfo = typeof fireAbilityEventInfo;

/**
 * Type matching all fire ability event name strings
 */
export type FireAbilityEvent = keyof FireAbilityEventInfo;
