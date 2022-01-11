import type { AttributeReferenceForeignObjectSelector } from '../objects/attribute-references/sources/attribute-reference';

/**
 * Type describing dictionary of event name strings to foreign attribute level available and built-in attribute names
 */
export type EventInfoEntry = readonly [readonly AttributeReferenceForeignObjectSelector[], readonly string[], readonly string[], readonly string[]];

/**
 * Record describing all base events
 */
export const baseEventInfo = {
    onGameStart: [[], [], [], []],
    onTurnAdvancement: [['team', 'player'], [], [], []]
} as const;

/**
 * Type matching record describing all base events
 */
export type BaseEventInfo = typeof baseEventInfo;

/**
 * Type matching all global event name strings
 */
export type BaseEvent = keyof BaseEventInfo;
