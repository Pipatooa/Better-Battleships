import type { Action } from '../../actions/action';
import { baseEvents } from '../../../events/base-events';

/**
 * List of event names for abilities
 */
export const baseAbilityEvents = [
    ...baseEvents,
    'onUse'
] as const;

/**
 * Type matching all ability event name strings
 */
export type AbilityEvent = typeof baseAbilityEvents[number];

/**
 * Type describing a dictionary of actions tied to ability event names
 */
export type AbilityActions = { [event in AbilityEvent]: Action[] };
