import type { EventInfoEntry }       from './base-events';
import type { EventContextForEvent } from './event-context';

/**
 * Type matching an event listener callback
 */
export type EventListenerCallback<T extends Record<S, EventInfoEntry>, S extends string, X extends S>
    = (eventContext: EventContextForEvent<T, S, X>) => void;

/**
 * Type matching a single event listener callback with a priority
 */
export type EventListener<T extends Record<S, EventInfoEntry>, S extends string, X extends S>
    = [ number, EventListenerCallback<T, S, X> ];

/**
 * Type matching a dictionary of event names to arrays of event listeners
 */
export type EventListeners<T extends Record<S, EventInfoEntry>, S extends string>
    = { [X in S]: EventListener<T, S, X>[] };
