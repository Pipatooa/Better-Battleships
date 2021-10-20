/**
 * List of global event names
 */
export const baseEvents = [
    'onTurnStart',
    'onTurnEnd'
] as const;

/**
 * Type matching all global event name strings
 */
export type BaseEvent = typeof baseEvents[number];
