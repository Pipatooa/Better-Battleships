import type { Action } from '../../actions/action';
import { baseAbilityEvents } from './base-ability-events';

/**
 * List of event names for fire ability
 */
export const fireAbilityEvents = [
    ...baseAbilityEvents,
    'onHit'
] as const;

/**
 * Type matching all fire ability event name strings
 */
export type FireAbilityEvent = typeof fireAbilityEvents[number];

/**
 * Type describing a dictionary of actions tied to ability event names
 */
export type FireAbilityActions = { [event in FireAbilityEvent]: Action[] };
